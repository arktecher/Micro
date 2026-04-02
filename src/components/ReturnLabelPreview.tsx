import React from 'react';
import { Package, Phone, MapPin, Calendar, Hash } from 'lucide-react';
import { Badge } from './ui/badge';
interface ReturnLabelProps {
    returnId: string;
    artworkId: string;
    rentalStartDate: string;
    rentalEndDate: string;
    shippingType: 'cash_on_delivery' | 'prepaid';
    corporate: {
        name: string;
        address: string;
        phone: string;
    };
    artist: {
        name: string;
        address: string;
        phone: string;
    };
    barcode?: string;
}
export const openReturnLabelInNewWindow = (data: ReturnLabelProps) => {
    const html = generateReturnLabelHTML(data);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
    }
};
const generateReturnLabelHTML = (data: ReturnLabelProps): string => {
    const shippingBadge = data.shippingType === 'cash_on_delivery'
        ? '<span style="background: #16a34a; color: white; padding: 4px 12px; border-radius: 4px; font-size: 13px; display: inline-block;">着払い</span>'
        : '<span style="background: #6b7280; color: white; padding: 4px 12px; border-radius: 4px; font-size: 13px; display: inline-block;">元払い</span>';
    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>返却用配送ラベル - MGJ</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Sans JP', sans-serif;
      background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);
      padding: 48px 16px;
      min-height: 100vh;
    }
    
    .container {
      max-width: 960px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .header h1 {
      color: #1f2937;
      font-size: 28px;
      font-weight: 500;
      margin-bottom: 8px;
    }
    
    .header p {
      color: #6b7280;
      font-size: 16px;
    }
    
    .print-info {
      background: #dbeafe;
      border: 1px solid #93c5fd;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      color: #1e40af;
      font-size: 14px;
    }
    
    .label-container {
      background: white;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      width: 420px;
      height: 594px;
      margin: 0 auto;
    }
    
    .label {
      width: 100%;
      height: 100%;
      border: 1px solid #d1d5db;
      padding: 12px;
      display: flex;
      flex-direction: column;
    }
    
    .label-header {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    
    .label-title-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .label-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    
    .label-logo-icon {
      width: 20px;
      height: 20px;
      color: #A67C52;
    }
    
    .label-logo-text {
      color: #A67C52;
      font-size: 13px;
      letter-spacing: 2px;
      font-weight: 500;
    }
    
    .label-title {
      color: #1f2937;
      font-size: 16px;
      font-weight: 500;
    }
    
    .barcode-area {
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      padding: 6px 8px;
      margin-top: 8px;
    }
    
    .barcode {
      width: 100%;
      height: 32px;
      margin-bottom: 2px;
    }
    
    .barcode-text {
      text-align: center;
      color: #374151;
      font-size: 9px;
      letter-spacing: 0.5px;
    }
    
    .address-section {
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .address-section.to {
      flex-grow: 1;
    }
    
    .address-label {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
    }
    
    .address-label-icon {
      width: 14px;
      height: 14px;
      color: #4b5563;
    }
    
    .address-label-text {
      color: #1f2937;
      font-size: 11px;
      font-weight: 500;
    }
    
    .address-content {
      padding-left: 20px;
    }
    
    .address-name {
      color: #111827;
      font-size: 12px;
      line-height: 1.4;
      font-weight: 600;
      margin-bottom: 2px;
    }
    
    .address-text {
      color: #374151;
      font-size: 11px;
      line-height: 1.5;
      margin-bottom: 2px;
    }
    
    .address-phone {
      color: #374151;
      font-size: 11px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .footer {
      background: #f9fafb;
      margin: -12px -12px -12px -12px;
      padding: 8px 12px;
      border-top: 1px solid #e5e7eb;
      margin-top: auto;
    }
    
    .footer-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 8px;
      margin-bottom: 8px;
    }
    
    .footer-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 9px;
    }
    
    .footer-item.span-2 {
      grid-column: span 2;
    }
    
    .footer-label {
      color: #6b7280;
    }
    
    .footer-value {
      color: #1f2937;
    }
    
    .footer-notes {
      border-top: 1px solid #d1d5db;
      padding-top: 6px;
    }
    
    .footer-warning {
      color: #ea580c;
      font-size: 8px;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 2px;
    }
    
    .footer-contact {
      color: #6b7280;
      font-size: 8px;
    }
    
    .print-button {
      background: #A67C52;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      margin: 24px auto 0;
      display: block;
      font-family: 'Noto Sans JP', sans-serif;
    }
    
    .print-button:hover {
      background: #8B5E3C;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .no-print {
        display: none !important;
      }
      
      .label-container {
        box-shadow: none;
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header no-print">
      <h1>返却用配送ラベル</h1>
      <p>以下のラベルを印刷して、梱包箱に貼り付けてください</p>
    </div>
    
    <div class="print-info no-print">
      <strong>印刷方法：</strong> 普通の用紙（A4サイズなど）で印刷し、ラベル部分を切り取って梱包箱の見やすい位置に貼り付けてください。
    </div>
    
    <div class="label-container">
      <div class="label">
        <div class="label-header">
          <div class="label-title-row">
            <div>
              <div class="label-logo">
                <svg class="label-logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                <span class="label-logo-text">MGJ</span>
              </div>
              <div class="label-title">返却用ラベル</div>
            </div>
            <div>
              ${shippingBadge}
            </div>
          </div>
          
          <div class="barcode-area">
            <svg class="barcode" viewBox="0 0 200 30">
              <rect x="5" y="0" width="2" height="30" fill="#000"/>
              <rect x="10" y="0" width="1" height="30" fill="#000"/>
              <rect x="13" y="0" width="3" height="30" fill="#000"/>
              <rect x="18" y="0" width="1" height="30" fill="#000"/>
              <rect x="22" y="0" width="2" height="30" fill="#000"/>
              <rect x="27" y="0" width="1" height="30" fill="#000"/>
              <rect x="30" y="0" width="4" height="30" fill="#000"/>
              <rect x="37" y="0" width="1" height="30" fill="#000"/>
              <rect x="40" y="0" width="2" height="30" fill="#000"/>
              <rect x="45" y="0" width="3" height="30" fill="#000"/>
              <rect x="50" y="0" width="1" height="30" fill="#000"/>
              <rect x="54" y="0" width="2" height="30" fill="#000"/>
              <rect x="59" y="0" width="1" height="30" fill="#000"/>
              <rect x="62" y="0" width="3" height="30" fill="#000"/>
              <rect x="68" y="0" width="1" height="30" fill="#000"/>
              <rect x="72" y="0" width="2" height="30" fill="#000"/>
              <rect x="77" y="0" width="4" height="30" fill="#000"/>
              <rect x="83" y="0" width="1" height="30" fill="#000"/>
              <rect x="87" y="0" width="2" height="30" fill="#000"/>
              <rect x="92" y="0" width="1" height="30" fill="#000"/>
              <rect x="96" y="0" width="3" height="30" fill="#000"/>
              <rect x="102" y="0" width="1" height="30" fill="#000"/>
              <rect x="106" y="0" width="2" height="30" fill="#000"/>
              <rect x="111" y="0" width="1" height="30" fill="#000"/>
              <rect x="115" y="0" width="4" height="30" fill="#000"/>
              <rect x="122" y="0" width="2" height="30" fill="#000"/>
              <rect x="127" y="0" width="1" height="30" fill="#000"/>
              <rect x="131" y="0" width="3" height="30" fill="#000"/>
              <rect x="137" y="0" width="1" height="30" fill="#000"/>
              <rect x="141" y="0" width="2" height="30" fill="#000"/>
              <rect x="146" y="0" width="1" height="30" fill="#000"/>
              <rect x="150" y="0" width="4" height="30" fill="#000"/>
              <rect x="157" y="0" width="1" height="30" fill="#000"/>
              <rect x="161" y="0" width="2" height="30" fill="#000"/>
              <rect x="166" y="0" width="3" height="30" fill="#000"/>
              <rect x="172" y="0" width="1" height="30" fill="#000"/>
              <rect x="176" y="0" width="2" height="30" fill="#000"/>
              <rect x="181" y="0" width="1" height="30" fill="#000"/>
              <rect x="185" y="0" width="4" height="30" fill="#000"/>
              <rect x="192" y="0" width="2" height="30" fill="#000"/>
            </svg>
            <div class="barcode-text">${data.barcode || 'YMT-00012345678'}</div>
          </div>
        </div>
        
        <div class="address-section">
          <div class="address-label">
            <svg class="address-label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span class="address-label-text">集荷元（FROM）</span>
          </div>
          <div class="address-content">
            <div class="address-name">${data.corporate.name}</div>
            <div class="address-text">${data.corporate.address}</div>
            <div class="address-phone">
              <svg style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              ${data.corporate.phone}
            </div>
          </div>
        </div>
        
        <div class="address-section to">
          <div class="address-label">
            <svg class="address-label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            <span class="address-label-text">お届け先（TO）</span>
            <span>🎨</span>
          </div>
          <div class="address-content">
            <div class="address-name">${data.artist.name}</div>
            <div class="address-text">${data.artist.address}</div>
            <div class="address-phone">
              <svg style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              ${data.artist.phone}
            </div>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-grid">
            <div class="footer-item">
              <svg style="width: 12px; height: 12px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
              </svg>
              <span class="footer-label">返却ID:</span>
              <span class="footer-value">${data.returnId}</span>
            </div>
            <div class="footer-item">
              <svg style="width: 12px; height: 12px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              <span class="footer-label">作品ID:</span>
              <span class="footer-value">${data.artworkId}</span>
            </div>
            <div class="footer-item span-2">
              <svg style="width: 12px; height: 12px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span class="footer-label">リース期間:</span>
              <span class="footer-value">${data.rentalStartDate} ～ ${data.rentalEndDate}</span>
            </div>
          </div>
          
          <div class="footer-notes">
            <div class="footer-warning">
              <span>⚠️</span>
              <span>このラベルに手書きで記入しないでください</span>
            </div>
            <div class="footer-contact">
              問い合わせ先：MGJサポート support@microgallery.jp
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <button class="print-button no-print" onclick="window.print()">ラベルを印刷</button>
  </div>
</body>
</html>`;
};
export const ReturnLabelPreview: React.FC<ReturnLabelProps> = ({ returnId, artworkId, rentalStartDate, rentalEndDate, shippingType, corporate, artist, barcode = 'YMT-00012345678', }) => {
    return (<div className="w-full max-w-4xl mx-auto p-8">
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg no-print">
        <p className="text-sm text-gray-700">
          <strong>印刷方法：</strong> 普通の用紙（A4サイズなど）で印刷し、ラベル部分を切り取って梱包箱の見やすい位置に貼り付けてください。
        </p>
      </div>

      
      <div className="bg-white shadow-xl mx-auto print-label" style={{ width: '420px', height: '594px', aspectRatio: '100/148' }}>
        
        <div className="w-full h-full border border-gray-300 p-3 flex flex-col print:border-gray-400">
          
          
          <div className="border-b border-gray-200 pb-3 mb-3">
            <div className="flex items-start justify-between mb-2">
              
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-5 h-5 text-[#A67C52]"/>
                  <span className="tracking-wider text-[#A67C52]" style={{ fontSize: '13px' }}>MGJ</span>
                </div>
                <h1 className="text-gray-800" style={{ fontSize: '16px' }}>返却用ラベル</h1>
              </div>

              
              <div>
                {shippingType === 'cash_on_delivery' ? (<Badge className="bg-green-600 text-white px-3 py-1" style={{ fontSize: '13px' }}>
                    着払い
                  </Badge>) : (<Badge className="bg-gray-500 text-white px-3 py-1" style={{ fontSize: '13px' }}>
                    元払い
                  </Badge>)}
              </div>
            </div>

            
            <div className="bg-white border border-gray-300 rounded px-2 py-1.5 mt-2">
              <div className="flex flex-col items-center">
                
                <div className="w-full h-8 flex items-center justify-center bg-white mb-0.5">
                  <svg viewBox="0 0 200 30" className="w-full h-full">
                    
                    <rect x="5" y="0" width="2" height="30" fill="#000"/>
                    <rect x="10" y="0" width="1" height="30" fill="#000"/>
                    <rect x="13" y="0" width="3" height="30" fill="#000"/>
                    <rect x="18" y="0" width="1" height="30" fill="#000"/>
                    <rect x="22" y="0" width="2" height="30" fill="#000"/>
                    <rect x="27" y="0" width="1" height="30" fill="#000"/>
                    <rect x="30" y="0" width="4" height="30" fill="#000"/>
                    <rect x="37" y="0" width="1" height="30" fill="#000"/>
                    <rect x="40" y="0" width="2" height="30" fill="#000"/>
                    <rect x="45" y="0" width="3" height="30" fill="#000"/>
                    <rect x="50" y="0" width="1" height="30" fill="#000"/>
                    <rect x="54" y="0" width="2" height="30" fill="#000"/>
                    <rect x="59" y="0" width="1" height="30" fill="#000"/>
                    <rect x="62" y="0" width="3" height="30" fill="#000"/>
                    <rect x="68" y="0" width="1" height="30" fill="#000"/>
                    <rect x="72" y="0" width="2" height="30" fill="#000"/>
                    <rect x="77" y="0" width="4" height="30" fill="#000"/>
                    <rect x="83" y="0" width="1" height="30" fill="#000"/>
                    <rect x="87" y="0" width="2" height="30" fill="#000"/>
                    <rect x="92" y="0" width="1" height="30" fill="#000"/>
                    <rect x="96" y="0" width="3" height="30" fill="#000"/>
                    <rect x="102" y="0" width="1" height="30" fill="#000"/>
                    <rect x="106" y="0" width="2" height="30" fill="#000"/>
                    <rect x="111" y="0" width="1" height="30" fill="#000"/>
                    <rect x="115" y="0" width="4" height="30" fill="#000"/>
                    <rect x="122" y="0" width="2" height="30" fill="#000"/>
                    <rect x="127" y="0" width="1" height="30" fill="#000"/>
                    <rect x="131" y="0" width="3" height="30" fill="#000"/>
                    <rect x="137" y="0" width="1" height="30" fill="#000"/>
                    <rect x="141" y="0" width="2" height="30" fill="#000"/>
                    <rect x="146" y="0" width="1" height="30" fill="#000"/>
                    <rect x="150" y="0" width="4" height="30" fill="#000"/>
                    <rect x="157" y="0" width="1" height="30" fill="#000"/>
                    <rect x="161" y="0" width="2" height="30" fill="#000"/>
                    <rect x="166" y="0" width="3" height="30" fill="#000"/>
                    <rect x="172" y="0" width="1" height="30" fill="#000"/>
                    <rect x="176" y="0" width="2" height="30" fill="#000"/>
                    <rect x="181" y="0" width="1" height="30" fill="#000"/>
                    <rect x="185" y="0" width="4" height="30" fill="#000"/>
                    <rect x="192" y="0" width="2" height="30" fill="#000"/>
                  </svg>
                </div>
                <p className="text-center text-gray-700" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>
                  {barcode}
                </p>
              </div>
            </div>
          </div>

          
          <div className="mb-3 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-600"/>
              <h2 className="text-gray-800" style={{ fontSize: '11px' }}>集荷元（FROM）</h2>
            </div>
            <div className="pl-5">
              <p className="text-gray-900 mb-0.5" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                <strong>{corporate.name}</strong>
              </p>
              <p className="text-gray-700 mb-0.5" style={{ fontSize: '11px', lineHeight: '1.5' }}>
                {corporate.address}
              </p>
              <p className="text-gray-700 flex items-center gap-1" style={{ fontSize: '11px' }}>
                <Phone className="w-3 h-3"/>
                {corporate.phone}
              </p>
            </div>
          </div>

          
          <div className="mb-3 pb-3 border-b border-gray-200 flex-grow">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Package className="w-3.5 h-3.5 text-[#A67C52]"/>
              <h2 className="text-gray-800" style={{ fontSize: '11px' }}>お届け先（TO）</h2>
              <span className="text-xs">🎨</span>
            </div>
            <div className="pl-5">
              <p className="text-gray-900 mb-0.5" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                <strong>{artist.name}</strong>
              </p>
              <p className="text-gray-700 mb-0.5" style={{ fontSize: '11px', lineHeight: '1.5' }}>
                {artist.address}
              </p>
              <p className="text-gray-700 flex items-center gap-1" style={{ fontSize: '11px' }}>
                <Phone className="w-3 h-3"/>
                {artist.phone}
              </p>
            </div>
          </div>

          
          <div className="bg-gray-50 -mx-3 -mb-3 px-3 py-2 border-t border-gray-200 mt-auto">
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-2">
              <div className="flex items-center gap-1">
                <Hash className="w-3 h-3 text-gray-500"/>
                <span className="text-gray-600" style={{ fontSize: '9px' }}>返却ID:</span>
                <span className="text-gray-800" style={{ fontSize: '9px' }}>{returnId}</span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3 text-gray-500"/>
                <span className="text-gray-600" style={{ fontSize: '9px' }}>作品ID:</span>
                <span className="text-gray-800" style={{ fontSize: '9px' }}>{artworkId}</span>
              </div>
              <div className="col-span-2 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-500"/>
                <span className="text-gray-600" style={{ fontSize: '9px' }}>リース期間:</span>
                <span className="text-gray-800" style={{ fontSize: '9px' }}>
                  {rentalStartDate} ～ {rentalEndDate}
                </span>
              </div>
            </div>

            
            <div className="border-t border-gray-300 pt-1.5 space-y-0.5">
              <p className="text-orange-600 flex items-center gap-1" style={{ fontSize: '8px' }}>
                <span>⚠️</span>
                <span>このラベルに手書きで記入しないでください</span>
              </p>
              <p className="text-gray-600" style={{ fontSize: '8px' }}>
                問い合わせ先：MGJサポート support@microgallery.jp
              </p>
            </div>
          </div>

        </div>
      </div>

      
      <div className="mt-6 flex justify-center gap-4 no-print">
        <button onClick={() => window.print()} className="px-6 py-2 bg-[#A67C52] text-white rounded-lg hover:bg-[#8B5E3C] transition-colors">
          ラベルを印刷
        </button>
      </div>
    </div>);
};
export const ReturnLabelDemo: React.FC = () => {
    const sampleData: ReturnLabelProps = {
        returnId: 'RTN-20250128-001',
        artworkId: 'ART-2024-567',
        rentalStartDate: '2024/06/15',
        rentalEndDate: '2025/01/28',
        shippingType: 'cash_on_delivery',
        corporate: {
            name: '株式会社サンプル商事',
            address: '〒150-0001 東京都渋谷区神宮前1-2-3 サンプルビル5F',
            phone: '03-1234-5678',
        },
        artist: {
            name: '山田 太郎',
            address: '〒160-0022 東京都新宿区新宿3-4-5 アートマンション201',
            phone: '090-1234-5678',
        },
        barcode: 'YMT-00012345678',
    };
    return (<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8 no-print">
          <h1 className="text-gray-800 mb-2">返却用配送ラベル</h1>
          <p className="text-gray-600">
            以下のラベルを印刷して、梱包箱に貼り付けてください
          </p>
        </div>

        <ReturnLabelPreview {...sampleData}/>
      </div>
    </div>);
};
