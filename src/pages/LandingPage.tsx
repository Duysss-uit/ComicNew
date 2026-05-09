/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="overflow-hidden bg-obsidian">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-12 px-6">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,77,0,0.1)_0%,_transparent_70%)]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center relative"
        >
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 text-[180px] font-black text-white/5 leading-none select-none italic pointer-events-none tracking-tighter">
            COMIC
          </div>
          
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-8 block">
            The Future of Digital Storytelling
          </span>
          <h1 className="text-[15vw] sm:text-[12vw] font-black leading-[0.8] tracking-tighter uppercase mb-12 italic">
            READ.<br />
            CREATE.<br />
            RISE.
          </h1>
          <p className="max-w-xl mx-auto text-lg text-ghost/60 mb-12 leading-relaxed font-medium">
            Phá bỏ giới hạn của con chữ và hình ảnh. Nền tảng truyện tranh và tiểu thuyết mạng thế hệ mới.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to="/home" 
              className="group flex items-center gap-3 px-10 py-5 bg-accent text-obsidian rounded-sm font-black uppercase tracking-tighter text-sm hover:scale-110 transition-transform"
              id="start-reading"
            >
              Bắt đầu đọc
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/auth" 
              className="px-10 py-5 border border-white/20 text-ghost rounded-sm font-black uppercase tracking-tighter text-sm hover:bg-white hover:text-obsidian transition-all"
              id="join-community"
            >
              Gia nhập cộng đồng
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats/Features Section */}
      <section className="py-32 border-y border-white/10 relative">
        <div className="px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Sáng tạo tột đỉnh", desc: "Công cụ đăng tải tối ưu cho cả họa sĩ và nhà văn." },
              { title: "Độc giả toàn cầu", desc: "Tiếp cận hàng triệu người dùng đam mê văn hóa đọc." },
              { title: "Đa nền tảng", desc: "Trải nghiệm mượt mà, đồng bộ hóa mọi tiến trình đọc." }
            ].map((feature, i) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-10 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors relative"
              >
                <div className="absolute top-0 left-0 w-1 h-0 bg-accent group-hover:h-full transition-all duration-300" />
                <span className="text-[10px] font-black text-accent mb-6 block tracking-widest opacity-40">0{i + 1} // ABILITY</span>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">{feature.title}</h3>
                <p className="text-sm text-ghost/40 leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Marquee */}
      <section className="py-24 bg-accent overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-12 items-center">
          {[
            "MANGA", "LIGHT NOVEL", "MANHWA", "NOIR", "ACTION", "ROMANCE", "CYBERPUNK", "FANTASY", "HORROR"
          ].map((cat, i) => (
            <span key={i} className="text-8xl font-black italic uppercase text-obsidian tracking-tighter">
              {cat}
            </span>
          ))}
          {/* Duplicate */}
          {[
            "MANGA", "LIGHT NOVEL", "MANHWA", "NOIR", "ACTION", "ROMANCE", "CYBERPUNK", "FANTASY", "HORROR"
          ].map((cat, i) => (
            <span key={i + 'd'} className="text-8xl font-black italic uppercase text-obsidian tracking-tighter">
              {cat}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
