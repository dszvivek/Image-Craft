import React, { useState } from 'react';
import { Download, RefreshCw, Lock, Unlock, Key, Copy, Check, AlertCircle } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';

const MAGIC_HEADER = [0x53, 0x54, 0x45, 0x47]; // "STEG"

interface ImageSteganographyProps {
  initialMode?: 'encode' | 'decode';
  pageTitle?: string;
  pageSubtitle?: string;
}

export const ImageSteganography: React.FC<ImageSteganographyProps> = ({
  initialMode = 'encode',
  pageTitle,
  pageSubtitle,
}) => {
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>(initialMode);

  // Encode State
  const [encodeFile, setEncodeFile] = useState<File | null>(null);
  const [encodeImageUrl, setEncodeImageUrl] = useState<string>('');
  const [encodeImageSize, setEncodeImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [secretMessage, setSecretMessage] = useState<string>('');
  const [encodePassword, setEncodePassword] = useState<string>('');
  const [encodedResultUrl, setEncodedResultUrl] = useState<string>('');
  const [isEncoding, setIsEncoding] = useState<boolean>(false);

  // Decode State
  const [decodeFile, setDecodeFile] = useState<File | null>(null);
  const [decodeImageUrl, setDecodeImageUrl] = useState<string>('');
  const [decodePassword, setDecodePassword] = useState<string>('');
  const [extractedMessage, setExtractedMessage] = useState<string | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Calculate max capacity for encode
  const maxCapacityChars = Math.max(0, Math.floor((encodeImageSize.width * encodeImageSize.height * 3 - 64) / 8));

  const handleEncodeFiles = (files: File[]) => {
    if (files.length > 0) {
      if (encodeImageUrl) URL.revokeObjectURL(encodeImageUrl);
      if (encodedResultUrl) URL.revokeObjectURL(encodedResultUrl);
      const f = files[0];
      setEncodeFile(f);
      const url = URL.createObjectURL(f);
      setEncodeImageUrl(url);
      setEncodedResultUrl('');

      const img = new Image();
      img.src = url;
      img.onload = () => {
        setEncodeImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      };
    }
  };

  const handleDecodeFiles = (files: File[]) => {
    if (files.length > 0) {
      if (decodeImageUrl) URL.revokeObjectURL(decodeImageUrl);
      const f = files[0];
      setDecodeFile(f);
      const url = URL.createObjectURL(f);
      setDecodeImageUrl(url);
      setExtractedMessage(null);
      setDecodeError(null);
    }
  };

  // Helper for XOR key encryption
  const xorEncrypt = (bytes: Uint8Array, key: string): Uint8Array => {
    if (!key) return bytes;
    const keyBytes = new TextEncoder().encode(key);
    const result = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      result[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
    }
    return result;
  };

  // Encode Secret Message into LSB
  const handleEncode = () => {
    if (!encodeImageUrl || !secretMessage.trim()) return;
    setIsEncoding(true);

    const img = new Image();
    img.src = encodeImageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsEncoding(false);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // 1. Prepare raw payload bytes: MAGIC_HEADER (4 bytes) + Length (4 bytes) + Encrypted Text (N bytes)
      const rawTextBytes = new TextEncoder().encode(secretMessage);
      const encryptedBytes = xorEncrypt(rawTextBytes, encodePassword);
      const payloadLength = encryptedBytes.length;

      const totalHeaderSize = 4 + 4; // 8 bytes = 64 bits
      const totalBitsNeeded = (totalHeaderSize + payloadLength) * 8;
      const totalBitsAvailable = canvas.width * canvas.height * 3; // 3 bits per pixel (R, G, B)

      if (totalBitsNeeded > totalBitsAvailable) {
        alert('Message is too long for this image size. Please choose a larger image or shorten the message.');
        setIsEncoding(false);
        return;
      }

      const payload = new Uint8Array(totalHeaderSize + payloadLength);
      // Magic Header
      payload.set(MAGIC_HEADER, 0);
      // Length (32-bit integer, Big Endian)
      payload[4] = (payloadLength >> 24) & 0xff;
      payload[5] = (payloadLength >> 16) & 0xff;
      payload[6] = (payloadLength >> 8) & 0xff;
      payload[7] = payloadLength & 0xff;
      // Encrypted Text
      payload.set(encryptedBytes, 8);

      // 2. Embed payload into LSB of RGB channels
      let bitIndex = 0;
      const totalBits = payload.length * 8;

      for (let i = 0; i < data.length && bitIndex < totalBits; i++) {
        // Skip Alpha channel (every 4th byte: index % 4 === 3)
        if (i % 4 === 3) continue;

        const byteIdx = Math.floor(bitIndex / 8);
        const bitOffset = 7 - (bitIndex % 8);
        const bitValue = (payload[byteIdx] >> bitOffset) & 1;

        // Replace LSB (data[i] & ~1 | bitValue)
        data[i] = (data[i] & 0xfe) | bitValue;
        bitIndex++;
      }

      ctx.putImageData(imgData, 0, 0);

      // Lossless PNG export
      canvas.toBlob((blob) => {
        if (!blob) {
          setIsEncoding(false);
          return;
        }
        if (encodedResultUrl) URL.revokeObjectURL(encodedResultUrl);
        const resUrl = URL.createObjectURL(blob);
        setEncodedResultUrl(resUrl);
        setIsEncoding(false);
      }, 'image/png');
    };
  };

  // Decode Secret Message from LSB
  const handleDecode = () => {
    if (!decodeImageUrl) return;
    setIsDecoding(true);
    setExtractedMessage(null);
    setDecodeError(null);

    const img = new Image();
    img.src = decodeImageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsDecoding(false);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // 1. Read first 64 bits to check Magic Header and Payload Length
      const headerBytes = new Uint8Array(8);
      let bitIndex = 0;

      for (let i = 0; i < data.length && bitIndex < 64; i++) {
        if (i % 4 === 3) continue; // skip alpha

        const bitValue = data[i] & 1;
        const byteIdx = Math.floor(bitIndex / 8);
        headerBytes[byteIdx] = (headerBytes[byteIdx] << 1) | bitValue;
        bitIndex++;
      }

      // Check Magic Header
      const isMagicValid =
        headerBytes[0] === MAGIC_HEADER[0] &&
        headerBytes[1] === MAGIC_HEADER[1] &&
        headerBytes[2] === MAGIC_HEADER[2] &&
        headerBytes[3] === MAGIC_HEADER[3];

      if (!isMagicValid) {
        setDecodeError('No hidden steganographic message detected in this image.');
        setIsDecoding(false);
        return;
      }

      const payloadLength =
        (headerBytes[4] << 24) |
        (headerBytes[5] << 16) |
        (headerBytes[6] << 8) |
        headerBytes[7];

      if (payloadLength <= 0 || payloadLength > (data.length * 3) / 8) {
        setDecodeError('Corrupted or invalid hidden data structure.');
        setIsDecoding(false);
        return;
      }

      // 2. Read Encrypted Text Payload Bits
      const payloadBytes = new Uint8Array(payloadLength);
      const totalPayloadBits = payloadLength * 8;
      let payloadBitIndex = 0;

      for (let i = 0; i < data.length && payloadBitIndex < totalPayloadBits; i++) {
        if (i % 4 === 3) continue;

        // Skip the first 64 bits (header)
        if (bitIndex < 64) {
          bitIndex++;
          continue;
        }

        const bitValue = data[i] & 1;
        const byteIdx = Math.floor(payloadBitIndex / 8);
        payloadBytes[byteIdx] = (payloadBytes[byteIdx] << 1) | bitValue;
        payloadBitIndex++;
      }

      // 3. Decrypt and Decode UTF-8
      try {
        const decryptedBytes = xorEncrypt(payloadBytes, decodePassword);
        const decodedText = new TextDecoder('utf-8', { fatal: true }).decode(decryptedBytes);
        setExtractedMessage(decodedText);
      } catch {
        setDecodeError('Incorrect password or corrupted ciphertext payload.');
      }

      setIsDecoding(false);
    };
  };

  const handleCopyText = () => {
    if (!extractedMessage) return;
    navigator.clipboard.writeText(extractedMessage);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadStego = () => {
    if (!encodedResultUrl) return;
    const a = document.createElement('a');
    a.href = encodedResultUrl;
    const baseName = encodeFile?.name.replace(/\.[^/.]+$/, '') || 'image';
    a.download = `${baseName}-stego.png`;
    a.click();
  };

  const handleResetEncode = () => {
    if (encodeImageUrl) URL.revokeObjectURL(encodeImageUrl);
    if (encodedResultUrl) URL.revokeObjectURL(encodedResultUrl);
    setEncodeFile(null);
    setEncodeImageUrl('');
    setEncodeImageSize({ width: 0, height: 0 });
    setSecretMessage('');
    setEncodePassword('');
    setEncodedResultUrl('');
  };

  const handleResetDecode = () => {
    if (decodeImageUrl) URL.revokeObjectURL(decodeImageUrl);
    setDecodeFile(null);
    setDecodeImageUrl('');
    setDecodePassword('');
    setExtractedMessage(null);
    setDecodeError(null);
  };

  const stegoSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Image Steganography Hidden Message Encoder & Decoder - ImagePlumber',
    'applicationCategory': 'SecurityApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'description': 'Hide secret text messages inside images using Least Significant Bit (LSB) steganography and password encryption. 100% private in-browser tool.',
    'featureList': [
      'Least Significant Bit (LSB) invisible text embedding',
      'Optional password encryption and scramble key',
      'Instant hidden text extraction and decoder',
      'Lossless PNG export with zero image distortion'
    ]
  };

  return (
    <div className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6">
      <SEO
        title={pageTitle || "Image Steganography - Hide Text in Image Online Free | ImagePlumber"}
        description={pageSubtitle || "Hide secret text messages inside images using LSB steganography with optional password encryption. 100% private in-browser encoder and decoder."}
        canonicalUrl="https://imageplumber.com/image-steganography"
        schema={stegoSchema}
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-650 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <Lock className="w-3.5 h-3.5" />
          <span>LSB Steganographic Cryptography</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight mb-4">
          {pageTitle || "Image Steganography Studio"}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          {pageSubtitle || "Embed secret text messages inside the Least Significant Bits (LSB) of photos with 0% visible change, or extract hidden messages with a passcode."}
        </p>

        {/* Tab Switcher */}
        <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl mt-6 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('encode')}
            className={`py-2 px-6 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'encode'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Encode (Hide Secret Message)</span>
          </button>
          <button
            onClick={() => setActiveTab('decode')}
            className={`py-2 px-6 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'decode'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Decode (Reveal Message)</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* ENCODE MODE */}
        {activeTab === 'encode' && (
          <div>
            {!encodeImageUrl ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
                <div className="md:col-span-7 flex flex-col justify-center">
                  <DropZone
                    onFilesSelected={handleEncodeFiles}
                    title="Drop photo to hide message inside"
                    subtitle="PNG, JPG, WebP supported (will export as lossless PNG)"
                  />
                </div>
                <div className="md:col-span-5 flex">
                  <div className="premium-bento rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between w-full shadow-sm">
                    <div className="space-y-4">
                      <div className="text-[10px] font-bold text-emerald-650 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                        Invisible Bit Storage
                      </div>
                      <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Zero Visual Distortion</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        LSB Steganography modifies only the lowest binary bit of RGB color values, making the embedded data completely invisible to the human eye.
                      </p>
                    </div>
                    <DemoPreview toolId="stego" alt="Steganography Preview" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Controls (6 cols) */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="premium-bento p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xl shadow-slate-200/20 dark:shadow-none">
                    
                    {/* Secret Message Input */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>Secret Text Message</span>
                        <span className="font-mono text-emerald-600 text-[11px]">
                          {secretMessage.length} / {maxCapacityChars.toLocaleString()} chars
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        value={secretMessage}
                        onChange={(e) => setSecretMessage(e.target.value)}
                        placeholder="Type your secret message, recovery seed phrase, or private note here..."
                        className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono leading-relaxed resize-none"
                      />
                    </div>

                    {/* Optional Passcode */}
                    <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Optional Encryption Password</span>
                      </label>
                      <input
                        type="password"
                        value={encodePassword}
                        onChange={(e) => setEncodePassword(e.target.value)}
                        placeholder="Leave blank for unencrypted LSB"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                      />
                      <p className="text-[10px] text-slate-400 leading-normal">
                        If password is set, the recipient must provide the exact same password to decode the hidden text.
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleResetEncode}
                        className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Reset</span>
                      </button>
                      <button
                        onClick={handleEncode}
                        disabled={isEncoding || !secretMessage.trim()}
                        className="flex-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Lock className="w-4 h-4" />
                        <span>{isEncoding ? 'Embedding Bits...' : 'Hide Message in Photo'}</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Stage Preview (6 cols) */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="relative rounded-3xl bg-slate-950/5 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 p-4 min-h-[320px] flex flex-col items-center justify-center overflow-hidden">
                    <img
                      src={encodedResultUrl || encodeImageUrl}
                      alt="Steganography Carrier"
                      className="max-w-full max-h-[380px] object-contain rounded-2xl shadow-xl select-none"
                    />

                    {encodedResultUrl && (
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>Message Encoded!</span>
                      </div>
                    )}
                  </div>

                  {encodedResultUrl ? (
                    <button
                      onClick={handleDownloadStego}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Steganographic PNG</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
                      <span>Dimensions: {encodeImageSize.width} × {encodeImageSize.height} px</span>
                      <span>Lossless PNG Output</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DECODE MODE */}
        {activeTab === 'decode' && (
          <div>
            {!decodeImageUrl ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
                <div className="md:col-span-7 flex flex-col justify-center">
                  <DropZone
                    onFilesSelected={handleDecodeFiles}
                    title="Drop steganographic image to decode"
                    subtitle="PNG image with hidden LSB payload"
                  />
                </div>
                <div className="md:col-span-5 flex">
                  <div className="premium-bento rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between w-full shadow-sm">
                    <div className="space-y-4">
                      <div className="text-[10px] font-bold text-teal-650 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-900 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                        Payload Extraction
                      </div>
                      <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Extract Secret Payloads</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        Upload any image created with our encoder, supply the optional passcode, and read the secret text.
                      </p>
                    </div>
                    <DemoPreview toolId="stego-decode" alt="Steganography Decode Preview" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Decode Controls (6 cols) */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="premium-bento p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xl shadow-slate-200/20 dark:shadow-none">
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-teal-500" />
                        <span>Decryption Password (If applicable)</span>
                      </label>
                      <input
                        type="password"
                        value={decodePassword}
                        onChange={(e) => setDecodePassword(e.target.value)}
                        placeholder="Enter password if one was set"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                      />
                    </div>

                    {decodeError && (
                      <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-2.5 text-red-600 dark:text-red-300 text-xs leading-relaxed">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{decodeError}</span>
                      </div>
                    )}

                    {extractedMessage && (
                      <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center text-xs font-bold text-emerald-600">
                          <span className="flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Hidden Message Revealed</span>
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {extractedMessage.length} characters
                          </span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs leading-relaxed break-all max-h-48 overflow-y-auto border border-slate-800">
                          {extractedMessage}
                        </div>
                        <button
                          onClick={handleCopyText}
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Secret Message'}</span>
                        </button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleResetDecode}
                        className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Reset</span>
                      </button>
                      <button
                        onClick={handleDecode}
                        disabled={isDecoding}
                        className="flex-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm shadow-lg shadow-teal-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Unlock className="w-4 h-4" />
                        <span>{isDecoding ? 'Extracting...' : 'Extract Hidden Message'}</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Preview Image (6 cols) */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="relative rounded-3xl bg-slate-950/5 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 p-4 min-h-[320px] flex items-center justify-center overflow-hidden">
                    <img
                      src={decodeImageUrl}
                      alt="Steganography Image"
                      className="max-w-full max-h-[380px] object-contain rounded-2xl shadow-xl select-none"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
                    <span>{decodeFile?.name || 'Stego Image'}</span>
                    <span>Decoded in Local RAM</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEO Guide Section */}
        <div className="mt-16 border-t border-slate-200/60 dark:border-slate-800 pt-12">
          <ToolGuide
            toolName="Image Steganography & Secret Text Encoder/Decoder"
            introText="Invisibly embed secret text, passwords, and private recovery phrases inside images using Least Significant Bit (LSB) steganography."
            competitorComparison={{
              alternatives: ['Steganography Online', 'Mobile Stego Apps', 'QuickStego'],
              benefit: 'Our steganography tool processes encryption and pixel bit embedding 100% client-side in your browser memory without uploading sensitive files or passcodes to external servers.',
            }}
            steps={[
              { title: 'Upload Carrier Image', description: 'Choose any clear photo or graphic.' },
              { title: 'Type Secret Message', description: 'Enter the text you wish to hide and set an optional password.' },
              { title: 'Download Stego PNG', description: 'Save the image as a lossless PNG (lossless format is required to preserve individual bit states).' },
              { title: 'Decode Anytime', description: 'Switch to the Decode tab, upload the PNG, enter your password, and read the extracted text.' },
            ]}
            features={[
              'Least Significant Bit (LSB) invisible text embedding',
              'Optional XOR key password encryption',
              'Instant hidden text extraction and decoder',
              'Lossless PNG export with zero image distortion'
            ]}
            faq={[
              { q: 'Will the image look different after hiding text in it?', a: 'No. LSB steganography only changes the lowest binary bit in color channels, resulting in color variations of at most 1/255th of a value, which is undetectable by the human eye.' },
              { q: 'Why is PNG format required for steganography?', a: 'JPEG uses lossy compression that alters pixel values and destroys the embedded bits. Lossless PNG preserves every pixel bit exactly.' }
            ]}
          />
        </div>

      </div>
    </div>
  );
};
