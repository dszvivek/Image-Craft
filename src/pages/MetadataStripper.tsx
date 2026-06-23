import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Fingerprint, Trash2, Eye, ShieldCheck, MapPin, Info } from 'lucide-react';
import { DropZone } from '../components/DropZone';
import { SEO } from '../components/SEO';
import { ToolGuide } from '../components/ToolGuide';
import metadataStripperGif from '../assets/metadata_stripper_feature.gif';
import metadataStripperStaticImg from '../assets/metadata_stripper_feature_static.webp';
import { DemoPreview } from '../components/DemoPreview';
import EXIF from 'exif-js';

interface ExifTag {
  label: string;
  value: string;
  category: 'camera' | 'exposure' | 'file' | 'gps' | 'other';
}

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
      setImageUrl(URL.createObjectURL(f));
      parseMetadata(f);
    }
  };

  // Helper to parse GPS coordinate values from rational numbers
  const parseGPSCoordinate = (gpsArr: any, ref: string) => {
    if (!gpsArr || gpsArr.length < 3) return null;
    const deg = gpsArr[0].numerator / gpsArr[0].denominator;
    const min = gpsArr[1].numerator / gpsArr[1].denominator;
    const sec = gpsArr[2].numerator / gpsArr[2].denominator;
    let decimal = deg + min / 60 + sec / 3600;
    if (ref === 'S' || ref === 'W') decimal = -decimal;
    return decimal;
  };

  const parseMetadata = (f: File) => {
    setIsProcessing(true);
    setMetadata([]);
    setGpsLink('');

    EXIF.getData(f as any, function (this: any) {
      const allTags = EXIF.getAllTags(this);
      const tempTags: ExifTag[] = [];

      // File Info
      if (f.name) tempTags.push({ label: 'Filename', value: f.name, category: 'file' });
      tempTags.push({ label: 'File Size', value: formatSize(f.size), category: 'file' });
      tempTags.push({ label: 'Mime Type', value: f.type, category: 'file' });

      if (allTags) {
        // Camera Info
        if (allTags.Make) tempTags.push({ label: 'Camera Make', value: String(allTags.Make), category: 'camera' });
        if (allTags.Model) tempTags.push({ label: 'Camera Model', value: String(allTags.Model), category: 'camera' });
        if (allTags.Software) tempTags.push({ label: 'Software', value: String(allTags.Software), category: 'camera' });
        if (allTags.DateTime) tempTags.push({ label: 'Shot Time', value: String(allTags.DateTime), category: 'file' });

        // Exposure Info
        if (allTags.FNumber) tempTags.push({ label: 'Aperture (F-Stop)', value: `f/${Number(allTags.FNumber)}`, category: 'exposure' });
        if (allTags.ExposureTime) {
          const exp = Number(allTags.ExposureTime);
          const expText = exp < 1 ? `1/${Math.round(1 / exp)}s` : `${exp}s`;
          tempTags.push({ label: 'Exposure Time', value: expText, category: 'exposure' });
        }
        if (allTags.ISOSpeedRatings) tempTags.push({ label: 'ISO Speed', value: String(allTags.ISOSpeedRatings), category: 'exposure' });
        if (allTags.FocalLength) tempTags.push({ label: 'Focal Length', value: `${Number(allTags.FocalLength)}mm`, category: 'exposure' });

        // GPS Info
        if (allTags.GPSLatitude && allTags.GPSLongitude) {
          const lat = parseGPSCoordinate(allTags.GPSLatitude, allTags.GPSLatitudeRef);
          const lon = parseGPSCoordinate(allTags.GPSLongitude, allTags.GPSLongitudeRef);
          
          if (lat !== null && lon !== null) {
            tempTags.push({ label: 'GPS Latitude', value: `${lat.toFixed(6)}° ${allTags.GPSLatitudeRef || ''}`, category: 'gps' });
            tempTags.push({ label: 'GPS Longitude', value: `${lon.toFixed(6)}° ${allTags.GPSLongitudeRef || ''}`, category: 'gps' });
            if (allTags.GPSAltitude) {
              const alt = allTags.GPSAltitude.numerator / allTags.GPSAltitude.denominator;
              tempTags.push({ label: 'GPS Altitude', value: `${alt.toFixed(1)} meters`, category: 'gps' });
            }
            setGpsLink(`https://www.google.com/maps?q=${lat},${lon}`);
          }
        }
      }

      setMetadata(tempTags);
      setIsProcessing(false);
    });
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

  const categorizedTags = (cat: 'file' | 'camera' | 'exposure' | 'gps') => 
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
                accept="image/jpeg"
                title="Drop photo here to inspect metadata"
                subtitle="Only JPG/JPEG files hold EXIF headers"
              />
            </div>
            <div className="md:col-span-5 flex">
              <div className="premium-bento rounded-3xl p-6 bg-white border border-slate-200/50 flex flex-col justify-between w-full shadow-sm hover:border-red-300 transition-all duration-300">
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-red-650 bg-red-50/50 border border-red-100/60 px-2 py-0.5 rounded uppercase tracking-wider inline-block">Demo Preview</div>
                  <h3 className="text-base font-extrabold text-slate-900">How Metadata Stripper Works</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Drop a JPEG to instantly expose hidden EXIF data — GPS coordinates, camera model, aperture and timestamps — then scrub them all with one click.
                  </p>
                </div>
                <DemoPreview
                  gifSrc={ metadataStripperGif }
                  staticSrc={ metadataStripperStaticImg }
                  alt="Metadata Stripper Demo"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            
            {/* Left Image View & Scrub Controls */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Image box */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                  Source Image Preview
                </span>
                <div className="w-full h-[280px] bg-slate-100/50 border border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center p-2 relative shadow-inner">
                  <img src={imageUrl} alt="Source" className="max-w-full max-h-full object-contain rounded-lg shadow-md" />
                </div>
              </div>

              {/* Stripping panel */}
              <div className="premium-bento p-5 rounded-3xl bg-white space-y-5 shadow-xs">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2 text-sm">
                  <Trash2 className="w-4.5 h-4.5 text-red-500" />
                  Scrub & Export Options
                </h3>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                    Target Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['image/jpeg', 'image/png'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setDownloadFormat(f)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          downloadFormat === f
                            ? 'bg-red-600 border-red-550 text-white shadow-md shadow-red-500/10'
                            : 'bg-slate-50 border-slate-200/70 text-slate-655 hover:text-slate-900'
                        }`}
                      >
                        {f === 'image/jpeg' ? 'JPEG (Lossy Clean)' : 'PNG (Lossless Clean)'}
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
                    className="w-full py-3 bg-white hover:bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-655 hover:text-slate-900 border border-slate-200/60 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Upload Different Photo
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-505 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 shadow-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Local Canvas redrawing strips EXIF headers instantly.
                </div>
              </div>

            </div>

            {/* Right Metadata Inspector Column */}
            <div className="lg:col-span-7 space-y-5 w-full">
              
              {/* Header */}
              <div className="flex justify-between items-center bg-white border border-slate-200/50 rounded-2xl px-4 py-3 shadow-xs">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Fingerprint className="w-4.5 h-4.5 text-red-500" />
                  EXIF Metadata Inspector
                </span>
                {isProcessing ? (
                  <span className="text-[10px] font-semibold text-slate-400 animate-pulse">Reading headers...</span>
                ) : (
                  <span className="text-[10px] text-red-655 font-bold uppercase tracking-wider bg-red-50 border border-red-100/60 px-2 py-0.5 rounded shadow-xs">
                    {metadata.length > 3 ? 'EXIF Tagged' : 'Metadata Free'}
                  </span>
                )}
              </div>

              {isProcessing ? (
                <div className="w-full h-[300px] bg-white border border-slate-200/55 rounded-3xl flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
                  <span className="text-xs font-semibold text-slate-450">Reading binary headers...</span>
                </div>
              ) : metadata.length <= 3 ? (
                <div className="premium-bento p-8 rounded-3xl bg-white text-center flex flex-col items-center gap-3.5 shadow-sm">
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
                  {(['file', 'camera', 'exposure', 'gps'] as const).map((cat) => {
                    const tags = categorizedTags(cat);
                    if (tags.length === 0) return null;
                    const catInfo = categories[cat];

                    return (
                      <div key={cat} className="premium-bento p-5 rounded-2xl bg-white space-y-3.5 shadow-sm">
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
