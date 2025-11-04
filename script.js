// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Sertifikatlar ro'yxati (30 ta uchun namuna - siz to'ldiring, PNG nomlari `./images/sertifikat/` papkasida bo'lsin)
    const sertifikatlar = [
      { id: 1, png: 'sertifikat_1.png' },
      { id: 2, png: 'sertifikat_2.png' },
      { id: 3, png: 'sertifikat_3.png' },
      // ... 4-30 gacha qo'shing: { id: 4, png: 'sertifikat_4.png' },
      // ... 30 tagacha
    ];
  
    // URL dan ID olish (masalan, ?id=1)
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const sertifikat = sertifikatlar.find(s => s.id === id);
  
    // Agar ID topilmasa - xato ko'rsatish
    if (!sertifikat) {
      const progressText = document.querySelector('.progress-text h3');
      const progressInfo = document.querySelector('.progress-info');
      progressText.innerHTML = '<span>Xato!</span>';
      progressInfo.textContent = 'Sertifikat topilmadi. To\'g\'ri linkdan foydalaning (masalan, ?id=1)';
      return;
    }
  
    // Elementlar
    const percentText = document.querySelector('.progress-text h3');
    const percentSpan = percentText.querySelector('span');
    const progressRing = document.querySelector('.progress-ring');
    const progressInfo = document.querySelector('.progress-info');
    const progressContainer = document.querySelector('.progress-container'); // Progress ni yashirish uchun
    const certificateDisplay = document.getElementById('certificate-display');
    const certImg = document.getElementById('cert-img');
    const certificateCard = document.querySelector('.certificate-card'); // Card ni resize uchun
    const downloadBtn = document.getElementById('download-btn');
    const shareBtn = document.getElementById('share-btn');
  
    // Boshlang'ich qiymat
    let currentPercent = 0;
    const targetPercent = 100;
    const duration = 2000; // 2 soniya
    const startTime = performance.now();
  
    // Doira o'lchami
    const circumference = 2 * Math.PI * 75; // r = 75
    progressRing.style.strokeDasharray = circumference;
    progressRing.style.strokeDashoffset = circumference;
  
    // Animatsiya funksiyasi
    function animateProgress(timestamp) {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
  
      currentPercent = Math.floor(progress * targetPercent);
  
      // Matn yangilash
      percentText.firstChild.textContent = currentPercent;
      percentSpan.textContent = '%';
  
      // Doira yangilash
      const offset = circumference - (currentPercent / 100) * circumference;
      progressRing.style.strokeDashoffset = offset;
  
      if (progress < 1) {
        requestAnimationFrame(animateProgress);
      } else {
        // 100% ga yetganda
        percentText.firstChild.textContent = '100';
  
        // Progress ni yashirish va PNG yuklash
        progressContainer.style.display = 'none';
        certImg.src = `./images/sertifikat/${sertifikat.png}`;
        certImg.onload = () => {
          certificateDisplay.style.display = 'block';
          // Card ni sertifikat o'lchamiga moslashtirish (2339x1656 ga proportsional)
          const imgRatio = certImg.naturalWidth / certImg.naturalHeight; // ~1.41 (landscape)
          const containerWidth = certificateCard.offsetWidth - 32; // Padding hisobga olib
          const newHeight = containerWidth / imgRatio;
          certificateCard.style.minHeight = `${newHeight + 100}px`; // +100 tugmalar uchun
          downloadBtn.disabled = false;
          downloadBtn.textContent = 'Yuklab olish (PDF)';
          downloadBtn.classList.add('enabled');
          shareBtn.classList.add('enabled');
        };
      }
    }
  
    // Animatsiyani boshlash
    requestAnimationFrame(animateProgress);
  
    // Yuklab olish (PNG → PDF)
    downloadBtn.addEventListener('click', async () => {
      if (!sertifikat) return;
      try {
        const canvas = await html2canvas(certImg, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`sertifikat_${sertifikat.id}.pdf`);
      } catch (error) {
        alert('Yuklab olishda xato: ' + error.message);
      }
    });
  
    // Ulashish (joriy linkni nusxalash)
    shareBtn.addEventListener('click', async () => {
      const link = window.location.href;
      try {
        await navigator.clipboard.writeText(link);
        alert(`Link nusxalandi: ${link}`);
      } catch (error) {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert(`Link nusxalandi: ${link}`);
      }
    });
  
    // Yandex Metrika
    (function(m,e,t,r,i,k,a){
      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
  
    ym(101551912, "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true
    });
  });