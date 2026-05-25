const sharp = require('sharp');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(400).json({ error: 'POST 요청만 허용됩니다' });
  }

  try {
    const { base64 } = req.body;
    
    if (!base64) {
      return res.status(400).json({ error: 'base64 필드가 필요합니다' });
    }

    const imageBuffer = Buffer.from(base64, 'base64');
    const jpegBuffer = await sharp(imageBuffer)
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();

    const jpegBase64 = jpegBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${jpegBase64}`;

    res.status(200).json({
      success: true,
      base64: jpegBase64,
      dataUrl: dataUrl,
      sizeKB: (jpegBuffer.length / 1024).toFixed(2)
    });

  } catch (error) {
    res.status(500).json({
      error: '이미지 변환 실패',
      message: error.message
    });
  }
}
