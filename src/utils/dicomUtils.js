import dicomParser from 'dicom-parser';

export const parseDicom = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        const byteArray = new Uint8Array(arrayBuffer);
        const dataSet = dicomParser.parseDicom(byteArray);

        // Helper function to safely read strings
        const getString = (tag) => {
          try {
            return dataSet.string(tag) || null;
          } catch (error) {
            return null;
          }
        };
        
        // Helper function to safely read integers (Uint16)
        const getUint16 = (tag) => {
            try {
                return dataSet.uint16(tag);
            } catch (error) {
                return null;
            }
        };

        // Extract basic metadata
        const metadata = {
          patientId: getString('x00100020'),
          patientName: getString('x00100010'),
          patientSex: getString('x00100040'),
          patientAge: getString('x00101010'),
          
          modality: getString('x00080060'),
          studyDate: getString('x00080020'),
          manufacturer: getString('x00080070'),
          institutionName: getString('x00080080'),

          rows: getUint16('x00280010'),
          columns: getUint16('x00280011'),
          pixelSpacing: getString('x00280030'),
          sliceThickness: getString('x00180050'),
          bitsAllocated: getUint16('x00280100'),
          samplesPerPixel: getUint16('x00280002'),
          photometricInterpretation: getString('x00280004'),
          
          // CT Specific
          rescaleSlope: getString('x00281053'),
          rescaleIntercept: getString('x00281052'),
          windowCenter: getString('x00281050'),
          windowWidth: getString('x00281051'),
          
          // X-ray Specific
          viewPosition: getString('x00185101'),
          bodyPartExamined: getString('x00180015'),
          exposure: getString('x00181152'),
          exposureTime: getString('x00181150'),
          kVp: getString('x00180060'),
          tubeCurrent: getString('x00181151')
        };
        
        // Normalize modality string
        const mod = (metadata.modality || '').toUpperCase();
        let modalityType = 'UNKNOWN';
        let modalityLabel = 'Unknown Modality';
        
        if (mod === 'CT') {
            modalityType = 'CT';
            modalityLabel = 'Computed Tomography (CT)';
        } else if (mod === 'CR' || mod === 'DX') {
            modalityType = 'XRAY';
            modalityLabel = 'Digital X-ray';
        } else if (mod === 'MR') {
            modalityType = 'MR';
            modalityLabel = 'MRI (Future Support)';
        } else if (mod === 'US') {
            modalityType = 'US';
            modalityLabel = 'Ultrasound (Future Support)';
        }

        metadata.modalityType = modalityType;
        metadata.modalityLabel = modalityLabel;

        // Try to read pixel data for preview if uncompressed
        let pixelData = null;
        try {
            const pixelDataElement = dataSet.elements['x7fe00010'];
            if (pixelDataElement && pixelDataElement.length > 0) {
                // Determine format
                const bitsAllocated = metadata.bitsAllocated || 16;
                const offset = pixelDataElement.dataOffset;
                const length = pixelDataElement.length;
                
                if (bitsAllocated === 16) {
                    // Int16 or Uint16 depending on pixel representation
                    const pixelRepresentation = getUint16('x00280103') || 0; // 0 = unsigned, 1 = signed
                    if (pixelRepresentation === 0) {
                        pixelData = new Uint16Array(arrayBuffer, offset, length / 2);
                    } else {
                        pixelData = new Int16Array(arrayBuffer, offset, length / 2);
                    }
                } else if (bitsAllocated === 8) {
                    pixelData = new Uint8Array(arrayBuffer, offset, length);
                }
            }
        } catch(e) {
            console.warn("Could not extract pixel data", e);
        }

        resolve({ metadata, pixelData, dataSet });
      } catch (error) {
        console.error('Error parsing DICOM:', error);
        reject(new Error('Invalid DICOM file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const renderDicomPreview = (canvas, pixelData, metadata) => {
    if (!canvas || !pixelData || !metadata.rows || !metadata.columns) return false;
    
    const { rows, columns, windowCenter, windowWidth, rescaleSlope, rescaleIntercept } = metadata;
    
    // Set canvas dimensions
    canvas.width = columns;
    canvas.height = rows;
    
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(columns, rows);
    const data = imageData.data;
    
    // Parse values or set defaults
    const wc = windowCenter !== null && windowCenter !== undefined ? parseFloat(windowCenter.split('\\')[0]) : null;
    const ww = windowWidth !== null && windowWidth !== undefined ? parseFloat(windowWidth.split('\\')[0]) : null;
    const rs = rescaleSlope !== null && rescaleSlope !== undefined ? parseFloat(rescaleSlope) : 1;
    const ri = rescaleIntercept !== null && rescaleIntercept !== undefined ? parseFloat(rescaleIntercept) : 0;
    
    // Determine min/max for windowing if not provided
    let min = Infinity;
    let max = -Infinity;
    if (wc === null || ww === null) {
        for (let i = 0; i < pixelData.length; i++) {
            let val = pixelData[i] * rs + ri;
            if (val < min) min = val;
            if (val > max) max = val;
        }
    }
    
    const center = wc !== null ? wc : (max + min) / 2;
    const width = ww !== null ? ww : (max - min);
    const low = center - width / 2;
    const high = center + width / 2;
    
    for (let i = 0; i < pixelData.length; i++) {
        let val = pixelData[i] * rs + ri;
        let p = 0;
        
        if (val <= low) {
            p = 0;
        } else if (val >= high) {
            p = 255;
        } else {
            p = Math.floor(((val - low) / width) * 255);
        }
        
        // Photometric Interpretation check
        if (metadata.photometricInterpretation === 'MONOCHROME1') {
            p = 255 - p;
        }
        
        const idx = i * 4;
        data[idx] = p;     // R
        data[idx + 1] = p; // G
        data[idx + 2] = p; // B
        data[idx + 3] = 255; // A
    }
    
    ctx.putImageData(imageData, 0, 0);
    return true;
};
