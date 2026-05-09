/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function Footer() {
  return (
    <footer className="bg-obsidian border-t border-white/10 py-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-8">
            <h1 className="font-display text-4xl tracking-tighter uppercase text-accent">comicnew.</h1>
          </div>
          <p className="text-sm text-ghost/40 max-w-sm leading-relaxed font-medium">
            Phá bỏ giới hạn của con chữ và hình ảnh. Nền tảng truyện tranh và tiểu thuyết mạng thế hệ mới cho thế hệ sáng tạo tiếp theo.
          </p>
        </div>
        
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-ghost mb-8 italic">Mục lục // DISCOVER</h4>
          <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-ghost/40">
            <li><a href="#" className="hover:text-accent transition-colors">Truyện mới</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Phổ biến</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Thể loại</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-ghost mb-8 italic">Kết nối // SUPPORT</h4>
          <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-ghost/40">
            <li><a href="#" className="hover:text-accent transition-colors">Về chúng tôi</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Điều khoản</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Bảo mật</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[8px] text-ghost/20 uppercase font-black tracking-[0.5em]">
          © 2026 comicnew. All rights reserved.
        </p>
        <div className="flex gap-8">
          <a href="#" className="text-[8px] text-ghost/20 font-black uppercase tracking-[0.5em] hover:text-accent transition-colors">Facebook</a>
          <a href="#" className="text-[8px] text-ghost/20 font-black uppercase tracking-[0.5em] hover:text-accent transition-colors">Twitter</a>
          <a href="#" className="text-[8px] text-ghost/20 font-black uppercase tracking-[0.5em] hover:text-accent transition-colors">Instagram</a>
        </div>
      </div>
    </footer>
  );
}
