import { useEffect, useState } from 'react'

const slides = [
  {
    image: '/illustrations/find.svg',
    eyebrow: 'ค้นหาได้ง่ายขึ้น',
    title: 'เลือกฮาร์ดแวร์ที่ตรงกับสเปกของคุณ',
    body: 'PC FINDER เตรียมพื้นที่สำหรับค้นหาและเลือกอุปกรณ์คอมพิวเตอร์แบบเป็นขั้นตอน',
  },
  {
    image: '/illustrations/compare.svg',
    eyebrow: 'เปรียบเทียบก่อนตัดสินใจ',
    title: 'มองเห็นตัวเลือกจากร้านค้าได้ชัดเจน',
    body: 'ระบบถูกออกแบบไว้ให้ต่อยอดกับข้อมูลราคา สต็อก และการจับคู่ร้านจาก Backend ในสัปดาห์ถัดไป',
  },
  {
    image: '/illustrations/build.svg',
    eyebrow: 'เก็บสเปกไว้ใช้งานต่อ',
    title: 'เตรียมเส้นทางสำหรับการจัดสเปกคอม',
    body: 'โครง Frontend รอบนี้วางพื้นฐาน Authentication และ Component เพื่อให้พัฒนาฟีเจอร์ต่อได้โดยไม่ต้องรื้อใหม่',
  },
]

export default function InfoCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length)
    }, 5500)
    return () => window.clearInterval(timer)
  }, [])

  const slide = slides[index]

  const handleTouchStart = (event) => {
    event.currentTarget.dataset.startX = event.touches[0].clientX
  }

  const handleTouchEnd = (event) => {
    const startX = Number(event.currentTarget.dataset.startX || 0)
    const diff = event.changedTouches[0].clientX - startX
    if (Math.abs(diff) < 45) return
    setIndex((current) => {
      if (diff < 0) return (current + 1) % slides.length
      return (current - 1 + slides.length) % slides.length
    })
  }

  return (
    <div className="info-carousel" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="carousel-visual">
        <img src={slide.image} alt="" />
      </div>
      <div className="carousel-copy">
        <span className="carousel-eyebrow">{slide.eyebrow}</span>
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
      </div>
      <div className="carousel-dots" aria-label="เลือกสไลด์">
        {slides.map((item, dotIndex) => (
          <button
            key={item.title}
            type="button"
            className={dotIndex === index ? 'dot active' : 'dot'}
            onClick={() => setIndex(dotIndex)}
            aria-label={`สไลด์ ${dotIndex + 1}`}
            aria-current={dotIndex === index ? 'true' : undefined}
          />
        ))}
      </div>
    </div>
  )
}
