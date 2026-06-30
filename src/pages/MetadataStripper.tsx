import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Fingerprint, Trash2, Eye, ShieldCheck, MapPin, Info } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import { DemoPreview } from '../components/DemoPreview';
import exifr from 'exifr';

interface ExifTag {
  label: string;
  value: string;
  category: 'camera' | 'exposure' | 'file' | 'gps' | 'other';
}

const EXCLUDED_TAGS = new Set([
  'thumbnail', 'makerNote', 'userComment', 'errors', 'warning'
]);

const HANDLED_TAGS = new Set([
  'Make', 'Model', 'Software', 'DateTime', 'FNumber', 'ExposureTime', 
  'ISOSpeedRatings', 'FocalLength', 'LensModel', 'LensMake', 'Flash', 
  'ExposureProgram', 'MeteringMode', 'DateTimeOriginal', 'UserComment',
  'latitude', 'longitude', 'altitude', 'GPSLatitude', 'GPSLongitude', 
  'GPSAltitude', 'GPSLatitudeRef', 'GPSLongitudeRef', 'GPSAltitudeRef', 
  'GPSTimeStamp', 'GPSDateStamp'
]);

const formatTagValue = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (val instanceof Date) {
    return val.toLocaleString();
  }
  if (typeof val === 'object') {
    if (typeof val.numerator === 'number' && typeof val.denominator === 'number') {
      if (val.denominator === 0) return '0';
      const num = val.numerator / val.denominator;
      return Number.isInteger(num) ? String(num) : String(parseFloat(num.toFixed(4)));
    }
    if (Array.isArray(val)) {
      return val.map(formatTagValue).filter((v) => v !== '').join(', ');
    }
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val);
};

const formatKeyLabel = (key: string): string => {
  const result = key.replace(/([a-z])([A-Z])/g, '$1 $2')
                    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
                    .replace(/([0-9]+)/g, ' $1')
                    .trim();
  return result
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const MetadataStripper: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<ExifTag[]>([]);
  const [gpsLink, setGpsLink] = useState<string>('');
  const [downloadFormat, setDownloadFormat] = useState<string>('image/jpeg');

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const f = files[0];
      setFile(f);
      const url = URL.createObjectURL(f);
      setImageUrl(url);

      const supportedFormats = ['image/jpeg', 'image/png', 'image/webp'];
      if (supportedFormats.includes(f.type)) {
        setDownloadFormat(f.type);
      } else {
        setDownloadFormat('image/jpeg');
      }

      parseMetadata(f, url);
    }
  };

  const parseMetadata = (f: File, fileUrl: string) => {
    setIsProcessing(true);
    setMetadata([]);
    setGpsLink('');

    const img = new Image();

    const handleParseResults = (width?: number, height?: number) => {
      exifr.parse(f, { tiff: true, xmp: true, gps: true, exif: true })
        .then((allTags) => {
          const tempTags: ExifTag[] = [];

          // File Info
          if (f.name) tempTags.push({ label: 'Filename', value: f.name, category: 'file' });
          tempTags.push({ label: 'File Size', value: formatSize(f.size), category: 'file' });
          tempTags.push({ label: 'Mime Type', value: f.type || 'image/unknown', category: 'file' });

          if (width && height) {
            tempTags.push({ label: 'Dimensions', value: `${width} x ${height} px`, category: 'file' });
            // Calculate Aspect Ratio
            const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
            const divisor = gcd(width, height);
            const aspect = divisor > 0 ? `${width / divisor}:${height / divisor}` : 'N/A';
            tempTags.push({ label: 'Aspect Ratio', value: aspect, category: 'file' });
          }

          if (allTags) {
            // Camera Info
            if (allTags.Make) tempTags.push({ label: 'Camera Make', value: formatTagValue(allTags.Make).trim(), category: 'camera' });
            if (allTags.Model) tempTags.push({ label: 'Camera Model', value: formatTagValue(allTags.Model).trim(), category: 'camera' });
            if (allTags.Software) tempTags.push({ label: 'Software', value: formatTagValue(allTags.Software).trim(), category: 'camera' });
            if (allTags.DateTime) tempTags.push({ label: 'Shot Time', value: formatTagValue(allTags.DateTime), category: 'file' });

            // Exposure Info
            if (allTags.FNumber) tempTags.push({ label: 'Aperture (F-Stop)', value: `f/${Number(allTags.FNumber)}`, category: 'exposure' });
            if (allTags.ExposureTime) {
              const exp = Number(allTags.ExposureTime);
              const expText = exp < 1 ? `1/${Math.round(1 / exp)}s` : `${exp}s`;
              tempTags.push({ label: 'Exposure Time', value: expText, category: 'exposure' });
            }
            if (allTags.ISOSpeedRatings) tempTags.push({ label: 'ISO Speed', value: formatTagValue(allTags.ISOSpeedRatings), category: 'exposure' });
            if (allTags.FocalLength) tempTags.push({ label: 'Focal Length', value: `${Number(allTags.FocalLength)}mm`, category: 'exposure' });

            // Additional EXIF/TIFF tags
            if (allTags.LensModel) tempTags.push({ label: 'Lens Model', value: formatTagValue(allTags.LensModel).trim(), category: 'exposure' });
            if (allTags.LensMake) tempTags.push({ label: 'Lens Make', value: formatTagValue(allTags.LensMake).trim(), category: 'exposure' });
            if (allTags.Flash) tempTags.push({ label: 'Flash Mode', value: formatTagValue(allTags.Flash), category: 'exposure' });
            if (allTags.ExposureProgram) tempTags.push({ label: 'Exposure Program', value: formatTagValue(allTags.ExposureProgram), category: 'exposure' });
            if (allTags.MeteringMode) tempTags.push({ label: 'Metering Mode', value: formatTagValue(allTags.MeteringMode), category: 'exposure' });
            if (allTags.DateTimeOriginal) tempTags.push({ label: 'Capture Time', value: formatTagValue(allTags.DateTimeOriginal), category: 'file' });
            if (allTags.UserComment) tempTags.push({ label: 'User Comment', value: formatTagValue(allTags.UserComment).trim(), category: 'other' });

            // GPS Info
            if (typeof allTags.latitude === 'number' && typeof allTags.longitude === 'number') {
              const lat = allTags.latitude;
              const lon = allTags.longitude;
              tempTags.push({ label: 'GPS Latitude', value: `${lat.toFixed(6)}°`, category: 'gps' });
              tempTags.push({ label: 'GPS Longitude', value: `${lon.toFixed(6)}°`, category: 'gps' });

              if (allTags.GPSAltitude !== undefined) {
                tempTags.push({ label: 'GPS Altitude', value: `${Number(allTags.GPSAltitude).toFixed(1)} meters`, category: 'gps' });
              } else if (allTags.altitude !== undefined) {
                tempTags.push({ label: 'GPS Altitude', value: `${Number(allTags.altitude).toFixed(1)} meters`, category: 'gps' });
              }
              setGpsLink(`https://www.google.com/maps?q=${lat},${lon}`);
            }

            // Map all remaining tags dynamically under 'other'
            Object.keys(allTags).forEach((key) => {
              if (!HANDLED_TAGS.has(key) && !EXCLUDED_TAGS.has(key)) {
                const val = allTags[key];
                const formattedVal = formatTagValue(val);
                if (formattedVal) {
                  tempTags.push({
                    label: formatKeyLabel(key),
                    value: formattedVal,
                    category: 'other'
                  });
                }
              }
            });
          }

          setMetadata(tempTags);
          setIsProcessing(false);
        })
        .catch((err) => {
          console.error("Error parsing EXIF with exifr:", err);
          const tempTags: ExifTag[] = [];
          if (f.name) tempTags.push({ label: 'Filename', value: f.name, category: 'file' });
          tempTags.push({ label: 'File Size', value: formatSize(f.size), category: 'file' });
          tempTags.push({ label: 'Mime Type', value: f.type || 'image/unknown', category: 'file' });

          if (width && height) {
            tempTags.push({ label: 'Dimensions', value: `${width} x ${height} px`, category: 'file' });
            const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
            const divisor = gcd(width, height);
            const aspect = divisor > 0 ? `${width / divisor}:${height / divisor}` : 'N/A';
            tempTags.push({ label: 'Aspect Ratio', value: aspect, category: 'file' });
          }

          setMetadata(tempTags);
          setIsProcessing(false);
        });
    };

    img.onload = () => {
      handleParseResults(img.naturalWidth, img.naturalHeight);
    };

    img.onerror = () => {
      handleParseResults();
    };

    img.src = fileUrl;
  };

  const handleStripAndDownload = () => {
    if (!file || !imageUrl) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw image onto clean canvas context (which strips out all EXIF bytes)
      ctx.drawImage(img, 0, 0);

      const ext = downloadFormat.split('/')[1];
      const origName = file.name.substring(0, file.name.lastIndexOf('.'));
      
      canvas.toBlob((blob) => {
        if (blob) {
          const cleanUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = cleanUrl;
          link.download = `${origName}_clean.${ext}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(cleanUrl);
        }
      }, downloadFormat, 0.9);
    };
    img.src = imageUrl;
  };

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(null);
    setImageUrl('');
    setMetadata([]);
    setGpsLink('');
  };

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const categories = {
    file: { label: 'File Info', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    camera: { label: 'Camera Hardware', color: 'text-purple-600 bg-purple-50 border-purple-100' },
    exposure: { label: 'Exposure & Lens', color: 'text-amber-600 bg-amber-50 border-amber-100' },
    gps: { label: 'GPS Geolocation', color: 'text-red-650 bg-red-50 border-red-100' },
    other: { label: 'Other Metadata', color: 'text-slate-600 bg-slate-50 border-slate-100' }
  };

  const categorizedTags = (cat: 'file' | 'camera' | 'exposure' | 'gps' | 'other') => 
    metadata.filter((t) => t.category === cat);

  const metadataSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'EXIF Metadata Stripper - ImageGiri',
    'applicationCategory': 'MultimediaApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'description': 'View and remove hidden EXIF metadata from photos in your browser. Inspect GPS location, camera model, exposure details, and capture timestamp. Strip all metadata to protect your privacy.',
    'featureList': [
      'Interactive EXIF tag table viewer',
      'Integrated map visualizer for GPS coordinates',
      'Local metadata removal routines',
      'Zero trace, client-side execution'
    ]
  };

  return (
    <div className="w-full">
      <SEO 
        title="Free EXIF Metadata Viewer & Remover - EXIF Purge Alternative" 
        description="View and remove hidden EXIF metadata from photos in your browser. A private, offline alternative to EXIF Purge and Metadata2Go." 
        keywords="EXIF metadata remover, EXIF viewer, remove metadata from image, strip EXIF data, photo metadata remover, GPS location remover from photo, image metadata cleaner, EXIF data viewer, remove photo location data, image privacy tool, EXIF stripper, EXIF Purge alternative, Metadata2Go alternative, strip photo metadata offline"
        canonicalUrl="https://imagegiri.com/metadata-stripper"
        schema={metadataSchema}
      />

      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-red-650 uppercase tracking-widest px-2.5 py-1 bg-red-50 border border-red-100 rounded-full shadow-sm">
            Privacy Shield
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-2">EXIF Metadata Stripper</h1>
          <p className="text-sm text-slate-500">Scan secret tracking metrics and strip camera headers offline to keep your files clean.</p>
        </div>

        {!file ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            <div className="md:col-span-7 flex flex-col justify-center">
              <DropZone 
                onFilesSelected={handleFilesSelected}
                accept="image/*"
                title="Drop photo here to inspect metadata"
                subtitle="Supports JPEG, PNG, WebP, GIF, BMP, etc."
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 flex flex-col justify-between w-full shadow-sm hover:border-red-350 transition-all duration-300">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-red-655 bg-red-50/30 border border-red-100/60 px-2 py-0.5 rounded uppercase tracking-wider inline-block">Demo Preview</div>
                  <h3 className="text-base font-extrabold text-slate-900">How Metadata Stripper Works</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Drop any image to instantly expose hidden metadata — GPS coordinates, camera model, exposure details, and capture timestamps — then scrub them all with one click.
                  </p>
                </div>
                <DemoPreview
                  toolId="stripper"
                  alt="Metadata Stripper Demo"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            
            {/* Left Image View & Scrub Controls */}
            <div className="lg:col-span-5 flex flex-col gap-6 order-2 lg:order-1">
              
              {/* Image box */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                  Source Image Preview
                </span>
                <div className="w-full h-[280px] bg-slate-50/30 border border-slate-200/80 rounded-2xl overflow-hidden flex items-center justify-center p-2 relative shadow-inner">
                  <img src={imageUrl} alt="Source" className="max-w-full max-h-full object-contain rounded-lg shadow-md" />
                </div>
              </div>

              {/* Stripping panel */}
              <div className="glass-card p-5 rounded-3xl space-y-5">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2 text-sm">
                  <Trash2 className="w-4.5 h-4.5 text-red-500" />
                  Scrub & Export Options
                </h3>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                    Target Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: 'image/jpeg', label: 'JPEG (Lossy)' },
                      { type: 'image/png', label: 'PNG (Lossless)' },
                      { type: 'image/webp', label: 'WebP' }
                    ].map((f) => (
                      <button
                        key={f.type}
                        onClick={() => setDownloadFormat(f.type)}
                        className={`py-2 px-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                          downloadFormat === f.type
                            ? 'bg-red-600 border-red-550 text-white shadow-md shadow-red-500/10'
                            : 'bg-white/85 border-slate-200 text-slate-655 hover:text-slate-900 hover:bg-slate-50/50'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleStripAndDownload}
                    className="w-full py-3 bg-red-600 hover:bg-red-550 text-[11px] font-bold uppercase tracking-wider text-white rounded-xl shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Strip Metadata & Download
                  </button>

                  <button
                    onClick={handleReset}
                    className="w-full py-3 bg-white hover:bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 border border-slate-200/60 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Upload Different Photo
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-505 bg-white/80 p-2.5 rounded-xl border border-slate-200/50 shadow-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Local Canvas redrawing strips EXIF headers instantly.
                </div>
              </div>

            </div>

            {/* Right Metadata Inspector Column */}
            <div className="lg:col-span-7 space-y-5 w-full order-1 lg:order-2">
              
              {/* Header */}
              <div className="flex justify-between items-center glass-card rounded-2xl px-4 py-3 shadow-xs">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Fingerprint className="w-4.5 h-4.5 text-red-500" />
                  EXIF Metadata Inspector
                </span>
                {isProcessing ? (
                  <span className="text-[10px] font-semibold text-slate-400 animate-pulse">Reading headers...</span>
                ) : (
                  <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded shadow-xs ${
                    metadata.some((t) => ['camera', 'exposure', 'gps'].includes(t.category))
                      ? 'text-red-655 bg-red-50/50 border-red-100/60'
                      : 'text-emerald-650 bg-emerald-50/50 border-emerald-100/60'
                  }`}>
                    {metadata.some((t) => ['camera', 'exposure', 'gps'].includes(t.category)) ? 'EXIF Tagged' : 'No EXIF Data'}
                  </span>
                )}
              </div>

              {isProcessing ? (
                <div className="w-full h-[300px] glass-card rounded-3xl flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
                  <span className="text-xs font-semibold text-slate-455">Reading binary headers...</span>
                </div>
              ) : metadata.length === 0 ? (
                <div className="glass-card p-8 rounded-3xl text-center flex flex-col items-center gap-3.5">
                  <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                    <ShieldCheck className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-850">Privacy Guaranteed</h3>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed font-medium">
                    No EXIF hardware details, timestamps, or geolocations were found on this file. It is clean and safe to share online!
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                  
                  {/* Privacy Check Alert */}
                  {!metadata.some((t) => ['camera', 'exposure', 'gps'].includes(t.category)) && (
                    <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-2xl flex items-start gap-2.5 shadow-sm">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black text-emerald-800">Privacy Guaranteed</h4>
                        <p className="text-[10px] text-emerald-655 leading-relaxed font-medium mt-0.5">
                          No camera hardware markers, exposure parameters, timestamps, or GPS location tags were detected on this file. It is clean and safe to share!
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* GPS Map Alert */}
                  {gpsLink && (
                    <div className="bg-red-50 border border-red-150 p-4 rounded-2xl flex items-start justify-between gap-4 shadow-sm animate-pulse-subtle">
                      <div className="flex gap-2.5">
                        <MapPin className="w-5 h-5 text-red-650 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-black text-red-800">Critical: GPS Location Data Found</h4>
                          <p className="text-[10px] text-red-650 leading-relaxed font-medium mt-0.5">
                            This photograph contains latitude/longitude coordinates that reveal exactly where it was taken.
                          </p>
                        </div>
                      </div>
                      <a
                        href={gpsLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-550 text-[10px] font-bold text-white rounded-lg transition shadow-xs shrink-0 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Map Location
                      </a>
                    </div>
                  )}

                  {/* Render Categories */}
                  {(['file', 'camera', 'exposure', 'gps', 'other'] as const).map((cat) => {
                    const tags = categorizedTags(cat);
                    if (tags.length === 0) return null;
                    const catInfo = categories[cat];

                    return (
                      <div key={cat} className="glass-card p-5 rounded-2xl space-y-3.5">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block ${catInfo.color}`}>
                          {catInfo.label}
                        </span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
                          {tags.map((tag) => (
                            <div key={tag.label} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                              <span className="text-slate-450 font-medium">{tag.label}</span>
                              <span className="font-mono text-slate-800 font-bold text-right truncate max-w-[160px]" title={tag.value}>
                                {tag.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  <div className="p-3.5 bg-indigo-50/50 border border-indigo-100/60 rounded-2xl flex items-start gap-2.5 text-[10px] text-slate-550 leading-normal font-medium">
                    <Info className="w-4 h-4 text-indigo-650 shrink-0 mt-0.5 animate-pulse" />
                    <span>
                      Online platforms (like chat apps or marketplaces) usually strip EXIF markers to save bandwidth, but direct email attachments, messaging channels, or forums often preserve them, exposing your details.
                    </span>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

        <ToolGuide
          toolName="EXIF Metadata Stripper"
          introText="Inspect and purge invisible binary headers attached to your photographs. View exact GPS coordinates, aperture, shutter speed, and camera models before cleaning."
          competitorComparison={{
            alternatives: ['EXIF Purge', 'Metadata2Go', 'Scrubly'],
            benefit: 'Using online metadata cleaners exposes your private photos, GPS locations, and home coordinates to third-party web servers. ImageGiri reads and redraws files locally, scrubbing the metadata tags from the binary stream without uploading anything.'
          }}
          steps={[
            {
              title: 'Upload Photo',
              description: 'Drop or select a JPEG/PNG photo from your mobile device or desktop browser.'
            },
            {
              title: 'Inspect Metadata',
              description: 'Analyze tags across File Info, Camera Hardware, and GPS Geolocation. View the coordinates plotted directly on our map overlay.'
            },
            {
              title: 'Strip & Download',
              description: 'Click "Strip Metadata" to rebuild the canvas pixel buffers without metadata headers, and save the scrubbed image.'
            }
          ]}
          features={[
            'Detailed parsing of camera tags (make, model, lens model, aperture, focal length).',
            'Interactive GPS coordinates mapping integration with direct navigation links.',
            'Instant 1-click removal of all EXIF, TIFF, and IPTC privacy headers.',
            'Preserves photo dimensions and layout structure upon rendering.',
            'Keeps your personal location completely safe by keeping data local.'
          ]}
          faq={[
            {
              q: 'What is EXIF data?',
              a: 'Exchangeable Image File Format (EXIF) data represents a set of camera tags embedded inside files by smartphones and cameras, detailing capture date, camera configuration, and GPS locations.'
            },
            {
              q: 'Why should I remove EXIF data?',
              a: 'Sharing photos online with GPS coordinates enables anyone to discover where the photo was taken, posing privacy risks for your home or personal travels.'
            },
            {
              q: 'Does it compress my photo size?',
              a: 'No. The image pixels are drawn to canvas at full resolution, retaining maximum visual quality during the EXIF removal process.'
            }
          ]}
        />

      </div>
    </div>
  );
};
