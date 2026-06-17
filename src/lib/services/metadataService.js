// ===================================================================
// METADATA SERVICE — Client-Side Lossless Metadata Flusher
// ===================================================================
//
// Wipes all EXIF, XMP, IPTC, comments, and device information client-side.
// Lossless by design: parses the binary chunks directly rather than decompressing
// and re-encoding, preserving 100% of original image quality and pixels.

export function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function result(blob, name, type, inputSize, note = "") {
  const outputSize = blob.size;
  return {
    blob,
    name,
    type,
    inputSize,
    outputSize,
    saved: inputSize - outputSize,
    ratio: inputSize ? outputSize / inputSize : 1,
    grew: outputSize >= inputSize,
    note,
  };
}

// ── Lossless JPEG EXIF/APP1/APP2 Segment Stripper ──
function stripJpegMetadata(arrayBuffer, strict = false) {
  const view = new DataView(arrayBuffer);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xFFD8) {
    return new Blob([arrayBuffer], { type: "image/jpeg" }); // Not a valid JPEG
  }

  const length = view.byteLength;
  let offset = 2;
  const cleanSegments = [];
  cleanSegments.push(arrayBuffer.slice(0, 2)); // Write SOI marker (0xFFD8)

  let lastOffset = 2;
  while (offset < length - 1) {
    if (view.getUint8(offset) === 0xFF) {
      const marker = view.getUint8(offset + 1);
      if (marker === 0xDA) { // SOS (Start of Scan) - image data starts here, stop parsing
        break;
      }
      
      // Markers like RSTx, SOI, EOI don't have size payloads
      if (marker >= 0xD0 && marker <= 0xD9) {
        offset += 2;
        continue;
      }

      if (offset + 4 > length) break;
      const markerLength = view.getUint16(offset + 2) + 2;

      // APP1 (0xFFE1) -> EXIF / XMP / IPTC
      // APP13 (0xFFED) -> Photoshop / IPTC
      // COM (0xFFFE) -> Text Comment
      // APP2 (0xFFE2) -> ICC Profile (Contains device profiles, stripped only in strict mode)
      const shouldStrip = marker === 0xE1 || marker === 0xED || marker === 0xFE || (strict && marker === 0xE2);

      if (shouldStrip) {
        // Exclude this segment, push whatever we skipped up to here
        if (offset > lastOffset) {
          cleanSegments.push(arrayBuffer.slice(lastOffset, offset));
        }
        lastOffset = offset + markerLength;
      }
      offset += markerLength;
    } else {
      offset++;
    }
  }

  // Push remaining image payload (SOS to EOI)
  if (lastOffset < length) {
    cleanSegments.push(arrayBuffer.slice(lastOffset, length));
  }

  return new Blob(cleanSegments, { type: "image/jpeg" });
}

// ── Lossless PNG Chunk Stripper (tEXt, zTXt, iTXt, iCCP, dSIG) ──
function stripPngMetadata(arrayBuffer, strict = false) {
  const view = new DataView(arrayBuffer);
  if (view.byteLength < 8 || view.getUint32(0) !== 0x89504E47 || view.getUint32(4) !== 0x0D0A1A0A) {
    return new Blob([arrayBuffer], { type: "image/png" }); // Not a valid PNG
  }

  const length = view.byteLength;
  let offset = 8;
  const cleanSegments = [];
  cleanSegments.push(arrayBuffer.slice(0, 8)); // Write PNG Signature

  const stripList = strict 
    ? ["tEXt", "zTXt", "iTXt", "iCCP", "dSIG"] 
    : ["tEXt", "zTXt", "iTXt", "dSIG"];

  while (offset < length) {
    if (offset + 8 > length) break;
    const chunkLength = view.getUint32(offset);
    const chunkTypeBytes = new Uint8Array(arrayBuffer, offset + 4, 4);
    const chunkType = String.fromCharCode(...chunkTypeBytes);
    const totalChunkLength = 12 + chunkLength; // 4 (length) + 4 (type) + payload + 4 (crc)

    // Strip metadata/color profiles that hold device/editor tracking details
    if (stripList.includes(chunkType)) {
      offset += totalChunkLength;
    } else {
      cleanSegments.push(arrayBuffer.slice(offset, offset + totalChunkLength));
      offset += totalChunkLength;
    }
  }

  return new Blob(cleanSegments, { type: "image/png" });
}

// ── Lossless WebP Chunk Stripper (EXIF, XMP, ICCP) ──
function stripWebpMetadata(arrayBuffer, strict = false) {
  const view = new DataView(arrayBuffer);
  if (view.byteLength < 12 || view.getUint32(0) !== 0x52494646 || view.getUint32(8) !== 0x57454250) {
    return new Blob([arrayBuffer], { type: "image/webp" }); // Not a valid WebP
  }

  const length = view.byteLength;
  let offset = 12;
  const cleanSegments = [];
  cleanSegments.push(arrayBuffer.slice(0, 12)); // RIFF header + WEBP signature

  const stripList = strict ? ["EXIF", "XMP ", "ICCP"] : ["EXIF", "XMP "];

  while (offset < length - 8) {
    const chunkTypeBytes = new Uint8Array(arrayBuffer, offset, 4);
    const chunkType = String.fromCharCode(...chunkTypeBytes);
    const chunkLength = view.getUint32(offset + 4, true); // Little-endian
    const paddedLength = chunkLength + (chunkLength % 2); // RIFF chunks are padded to even bytes
    const totalChunkLength = 8 + paddedLength;

    if (stripList.includes(chunkType)) {
      offset += totalChunkLength;
    } else {
      cleanSegments.push(arrayBuffer.slice(offset, offset + totalChunkLength));
      offset += totalChunkLength;
    }
  }

  return new Blob(cleanSegments, { type: "image/webp" });
}

export async function flushFileMetadata(file, strict = false) {
  const name = file.name;
  const type = file.type;
  const size = file.size;

  const arrayBuffer = await file.arrayBuffer();
  let cleanBlob;
  let note = "Metadata flushed";

  if (type === "image/jpeg" || /\.jpe?g$/i.test(name)) {
    cleanBlob = stripJpegMetadata(arrayBuffer, strict);
  } else if (type === "image/png" || /\.png$/i.test(name)) {
    cleanBlob = stripPngMetadata(arrayBuffer, strict);
  } else if (type === "image/webp" || /\.webp$/i.test(name)) {
    cleanBlob = stripWebpMetadata(arrayBuffer, strict);
  } else {
    // Unsupported/already clean fallback - keep as is
    cleanBlob = new Blob([arrayBuffer], { type });
    note = "Skipped (no standard metadata container)";
  }

  // Generate name: "photo.jpg" -> "photo.clean.jpg"
  const dotIndex = name.lastIndexOf(".");
  let newName;
  if (dotIndex !== -1) {
    newName = name.slice(0, dotIndex) + ".clean" + name.slice(dotIndex);
  } else {
    newName = name + ".clean";
  }

  return result(cleanBlob, newName, type, size, note);
}

export async function flushMetadata(fileList, strict = false) {
  const files = [...fileList];
  if (files.length === 0) return [];
  
  const results = [];
  for (const file of files) {
    results.push(await flushFileMetadata(file, strict));
  }
  return results;
}

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
