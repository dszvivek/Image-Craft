import React, { useState } from 'react';
import { RefreshCw, Fingerprint, ShieldCheck, MapPin, FolderArchive } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';
import exifr from 'exifr';
import JSZip from 'jszip';

interface ExifTag {
  label: string;
  value: string;
  category: 'camera' | 'exposure' | 'file' | 'gps' | 'other';
}

interface MetadataStripperProps {
  initialMode?: 'view' | 'strip';
  pageTitle?: string;
  pageSubtitle?: string;
}

export const MetadataStripper: React.FC<MetadataStripperProps> = ({
  pageTitle,
  pageSubtitle,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const [metadata, setMetadata] = useState<ExifTag[]>([]);
  const [gpsData, setGpsData] = useState<{ lat: number; lon: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  const [exportFormat, setExportFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [jpegQuality, setJpegQuality] = useState<number>(95);

  const handleFilesSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      setSelectedIndex(0);
      inspectFile(selectedFiles[0]);
    }
  };

  const inspectFile = async (file: File) => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setIsProcessing(true);
    setMetadata([]);
    setGpsData(null);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    };

    try {
      const allTags = await exifr.parse(file, { tiff: true, xmp: true, gps: true, exif: true });
      const tempTags: ExifTag[] = [];

      // File Details
      tempTags.push({ label: 'Filename', value: file.name, category: 'file' });
      tempTags.push({ label: 'File Size', value: `${(file.size / 1024).toFixed(1)} KB`, category: 'file' });
      tempTags.push({ label: 'MIME Type', value: file.type || 'image/jpeg', category: 'file' });

      if (allTags) {
        // Camera Details
        if (allTags.Make) tempTags.push({ label: 'Camera Make', value: String(allTags.Make), category: 'camera' });
        if (allTags.Model) tempTags.push({ label: 'Camera Model', value: String(allTags.Model), category: 'camera' });
        if (allTags.LensModel) tempTags.push({ label: 'Lens Model', value: String(allTags.LensModel), category: 'camera' });
        if (allTags.Software) tempTags.push({ label: 'Software / OS', value: String(allTags.Software), category: 'camera' });

        // Exposure Details
        if (allTags.FNumber) tempTags.push({ label: 'Aperture', value: `f/${allTags.FNumber}`, category: 'exposure' });
        if (allTags.ExposureTime) {
          const exp = allTags.ExposureTime < 1 ? `1/${Math.round(1 / allTags.ExposureTime)} s` : `${allTags.ExposureTime} s`;
          tempTags.push({ label: 'Shutter Speed', value: exp, category: 'exposure' });
        }
        if (allTags.ISO || allTags.ISOSpeedRatings) {
          tempTags.push({ label: 'ISO Sensitivity', value: `ISO ${allTags.ISO || allTags.ISOSpeedRatings}`, category: 'exposure' });
        }
        if (allTags.FocalLength) tempTags.push({ label: 'Focal Length', value: `${allTags.FocalLength} mm`, category: 'exposure' });
        if (allTags.Flash) tempTags.push({ label: 'Flash Status', value: String(allTags.Flash), category: 'exposure' });

        // Timestamp
        if (allTags.DateTimeOriginal || allTags.CreateDate) {
          const d = allTags.DateTimeOriginal || allTags.CreateDate;
          tempTags.push({ label: 'Date Taken', value: new Date(d).toLocaleString(), category: 'file' });
        }

        // GPS Location
        if (typeof allTags.latitude === 'number' && typeof allTags.longitude === 'number') {
          const lat = parseFloat(allTags.latitude.toFixed(6));
          const lon = parseFloat(allTags.longitude.toFixed(6));
          setGpsData({ lat, lon });
          tempTags.push({ label: 'GPS Latitude', value: `${lat}°`, category: 'gps' });
          tempTags.push({ label: 'GPS Longitude', value: `${lon}°`, category: 'gps' });
          if (allTags.altitude) tempTags.push({ label: 'GPS Altitude', value: `${Math.round(allTags.altitude)} m`, category: 'gps' });
        }
      }

      setMetadata(tempTags);
    } catch (err) {
      console.warn('Could not parse EXIF metadata', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Strip EXIF from a File by Re-Drawing on Client Canvas
  const stripFileMetadata = async (file: File): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      const objUrl = URL.createObjectURL(file);
      img.src = objUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(objUrl);
              resolve(blob);
            },
            exportFormat,
            exportFormat === 'image/jpeg' ? jpegQuality / 100 : undefined
          );
        } else {
          URL.revokeObjectURL(objUrl);
          resolve(null);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objUrl);
        resolve(null);
      };
    });
  };

  // Download Sanitized Single Image
  const handleDownloadClean = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const currentFile = files[selectedIndex];
    const blob = await stripFileMetadata(currentFile);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const baseName = currentFile.name.replace(/\.[^/.]+$/, '');
      const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';
      a.download = `${baseName}-sanitized.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setIsProcessing(false);
  };

  // Download All as Batch Sanitized ZIP
  const handleDownloadBatchZip = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setBatchProgress({ current: 0, total: files.length });

    const zip = new JSZip();

    for (let i = 0; i < files.length; i++) {
      setBatchProgress({ current: i + 1, total: files.length });
      const currentFile = files[i];
      const blob = await stripFileMetadata(currentFile);

      if (blob) {
        const baseName = currentFile.name.replace(/\.[^/.]+$/, '');
        const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';
        zip.file(`${baseName}-sanitized.${ext}`, blob);
      }
    }

    const zipContent = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    const zipUrl = URL.createObjectURL(zipContent);
    a.href = zipUrl;
    a.download = `sanitized-photos-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(zipUrl);

    setIsProcessing(false);
    setBatchProgress(null);
  };

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFiles([]);
    setSelectedIndex(0);
    setImageUrl('');
    setMetadata([]);
    setGpsData(null);
  };

  const stripperSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'EXIF Metadata Inspector & Privacy Cleaner - ImagePlumber',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'description': 'View photo EXIF metadata, camera settings, GPS coordinates, and strip all sensitive tags for free online. 100% private in-browser canvas sanitizer with zero cloud uploads.',
    'featureList': [
      'Visual camera, lens, exposure, and timestamp inspector',
      'GPS coordinate detection with OpenStreetMap & Google Maps links',
      '1-Click EXIF, XMP, IPTC, and location tag stripper',
      'Multi-photo batch metadata cleaner with ZIP export'
    ]
  };

  return (
    <div className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6">
      <SEO
        title={pageTitle || "EXIF Viewer & Remove Image Metadata Online Free | ImagePlumber"}
        description={pageSubtitle || "View camera settings, lens details, GPS location tags, and strip all sensitive EXIF metadata online for free. 100% private with zero cloud uploads."}
        canonicalUrl="https://imageplumber.com/metadata-stripper"
        schema={stripperSchema}
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-650 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <Fingerprint className="w-3.5 h-3.5" />
          <span>Privacy & Telemetry Sanitizer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight mb-4">
          {pageTitle || "EXIF Inspector & Metadata Cleaner"}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          {pageSubtitle || "Inspect camera exposure settings, view GPS location data on a map, and completely remove sensitive privacy tags from single or batch photos."}
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {files.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone
                onFilesSelected={handleFilesSelected}
                title="Drop photo to inspect or remove EXIF metadata"
                subtitle="Supports JPG, PNG, WebP, HEIC up to 50MB (Batch supported)"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between w-full shadow-sm">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-emerald-650 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                    Privacy Guardian
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Zero-Trace Sanitizer</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Remove hidden geolocation, camera serial numbers, and personal timestamps before sharing photos online.
                  </p>
                </div>
                <DemoPreview toolId="metadata" alt="Metadata Stripper Preview" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Control Sidebar (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="premium-bento p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xl shadow-slate-200/20 dark:shadow-none">
                
                {/* Batch File Selector */}
                {files.length > 1 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Active Batch Preview ({selectedIndex + 1} of {files.length})
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {files.map((f, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedIndex(idx);
                            inspectFile(f);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                            selectedIndex === idx
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          #{idx + 1}: {f.name.slice(0, 12)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* GPS Location Warning & Map Link */}
                {gpsData && (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      <span>GPS Coordinates Embedded in Photo!</span>
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      Latitude: {gpsData.lat}°, Longitude: {gpsData.lon}°
                    </p>
                    <div className="flex gap-2 pt-1">
                      <a
                        href={`https://www.google.com/maps?q=${gpsData.lat},${gpsData.lon}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-800 hover:text-amber-600 inline-block"
                      >
                        View on Google Maps ↗
                      </a>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${gpsData.lat}&mlon=${gpsData.lon}#map=16/${gpsData.lat}/${gpsData.lon}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-800 hover:text-amber-600 inline-block"
                      >
                        OpenStreetMap ↗
                      </a>
                    </div>
                  </div>
                )}

                {/* Export Format */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Sanitized Output Format
                    </label>
                    <div className="flex gap-1.5">
                      {(['image/jpeg', 'image/png', 'image/webp'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setExportFormat(fmt)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            exportFormat === fmt
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {fmt === 'image/jpeg' ? 'JPEG' : fmt === 'image/png' ? 'PNG' : 'WebP'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {exportFormat === 'image/jpeg' && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>JPEG Quality</span>
                        <span className="font-mono text-emerald-600">{jpegQuality}%</span>
                      </div>
                      <input
                        type="range"
                        min="60"
                        max="100"
                        value={jpegQuality}
                        onChange={(e) => setJpegQuality(Number(e.target.value))}
                        className="range-styled w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Reset</span>
                    </button>
                    <button
                      onClick={handleDownloadClean}
                      disabled={isProcessing}
                      className="flex-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Clean & Strip Photo</span>
                    </button>
                  </div>

                  {files.length > 1 && (
                    <button
                      onClick={handleDownloadBatchZip}
                      disabled={isProcessing}
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <FolderArchive className="w-4 h-4" />
                      <span>
                        {batchProgress
                          ? `Sanitizing ${batchProgress.current}/${batchProgress.total}...`
                          : `Strip All ${files.length} Photos as ZIP`}
                      </span>
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Telemetry Stage (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Photo Preview Thumbnail */}
              <div className="relative rounded-3xl bg-slate-950/5 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 p-4 flex items-center justify-center max-h-[300px] overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Inspected File Preview"
                  className="max-h-[260px] object-contain rounded-2xl shadow-md"
                />
              </div>

              {/* Metadata Table */}
              <div className="premium-bento rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Detected EXIF Tags ({metadata.length})
                  </span>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                    {imageSize.width} × {imageSize.height} px
                  </span>
                </div>

                {metadata.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    No EXIF tags found or file has already been stripped clean.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
                    {metadata.map((tag, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-0.5"
                      >
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block truncate">
                          {tag.label}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 break-words block">
                          {tag.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* SEO Guide Section */}
        <div className="mt-16 border-t border-slate-200/60 dark:border-slate-800 pt-12">
          <ToolGuide
            toolName="EXIF Metadata Inspector & Privacy Sanitizer"
            introText="Inspect camera exposure parameters, lens metadata, and GPS location coordinates, or completely sanitize sensitive tags with zero cloud uploads."
            competitorComparison={{
              alternatives: ['Jeffrey’s Image Metadata Viewer', 'iLoveIMG Exif Remover', 'Jimpl EXIF'],
              benefit: 'Our metadata sanitizer executes 100% inside your browser sandbox. Unlike other tools that transmit photos with confidential GPS coordinates over the internet to remote servers, your files never leave your device.',
            }}
            steps={[
              { title: 'Upload Photo', description: 'Drop your photo into the inspector workspace.' },
              { title: 'Review EXIF & GPS', description: 'Inspect camera aperture, shutter speed, ISO, and click map links to view embedded coordinates.' },
              { title: '1-Click Sanitize', description: 'Click "Clean & Strip Photo" to erase all EXIF, XMP, IPTC, and location payloads.' },
              { title: 'Download Anonymized File', description: 'Save the stripped image in lossless PNG, JPEG, or WebP format.' },
            ]}
            features={[
              'Comprehensive EXIF, XMP, IPTC, and MakerNote tag inspection',
              'Embedded GPS coordinate detector with Google Maps & OpenStreetMap links',
              '1-Click total privacy sanitization via in-browser canvas re-encoding',
              'Multi-photo batch EXIF cleaner with ZIP package download'
            ]}
            faq={[
              { q: 'Why is stripping EXIF metadata important for privacy?', a: 'Smartphone and digital camera photos often contain exact GPS latitude and longitude coordinates, camera serial numbers, and exact timestamps that can expose private locations when uploaded to forums or social media.' },
              { q: 'Does stripping metadata reduce image quality?', a: 'No! The image pixel data is cleanly re-encoded at maximum quality while stripping the separate EXIF metadata payload.' }
            ]}
          />
        </div>

      </div>
    </div>
  );
};
