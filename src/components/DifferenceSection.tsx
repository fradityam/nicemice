import { Award, Palette, Sliders, HeartHandshake } from 'lucide-react';

export default function DifferenceSection() {
  const features = [
    {
      icon: Award,
      title: 'Kualitas Premium',
      description: 'Kualitas tinggi yang responsif, tajam di semua layar gadget, dan memberikan impresi kemewahan di setiap detail digital.'
    },
    {
      icon: Palette,
      title: 'Didesain oleh Seniman',
      description: 'Tata letak pesanan kami dirancang secara manual dan dikodekan oleh komunitas desainer kami. Setiap pembelian premium mendukung komunitas seniman tipografi independen.'
    },
    {
      icon: Sliders,
      title: 'Kemudahan Kustomisasi',
      description: 'Sesuaikan setiap elemen. Ubah warna, ukuran, hiasan bunga, bingkai kustom, pembagian daftar tamu, dan alunan musik latar dengan mudah.'
    },
    {
      icon: HeartHandshake,
      title: 'Dukungan Gratis',
      description: 'Wujudkan visi pernikahan impian Anda. Dapatkan bantuan tim spesialis pernikahan kami untuk mendesain, menyelesaikan, dan memeriksa isi Daftar Hadiah Pernikahan.'
    }
  ];

  return (
    <section className="py-24 bg-white border-t border-zinc-150/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="font-serif italic text-zinc-500 text-lg mb-1">Janji utama kami</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A1A1A] tracking-tight">
            Keistimewaan nicemice
          </h2>
          <div className="h-0.5 w-16 bg-[#C5A059] mx-auto mt-4 rounded"></div>
        </div>

        {/* Features 4-column layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feat) => {
            const IconComponent = feat.icon;
            return (
              <div
                key={feat.title}
                className="group flex flex-col items-center text-center p-6 rounded-2xl bg-[#FAF9F6] border border-[#E5E2D9] hover:bg-white hover:shadow-md hover:border-[#C5A059] transition-all duration-300"
              >
                {/* Elegant Circle Icon */}
                <div className="w-12 h-12 rounded-full bg-white group-hover:bg-[#C5A059]/5 border border-zinc-200 group-hover:border-[#C5A059]/20 flex items-center justify-center text-zinc-700 group-hover:text-[#C5A059] transition-colors mb-6 shadow-sm">
                  <IconComponent className="w-5 h-5" />
                </div>

                <h3 className="font-serif italic text-base text-[#1A1A1A] tracking-wide mb-3">
                  {feat.title}
                </h3>
                
                <p className="text-[#6B6B6B] text-xs tracking-wide leading-relaxed font-sans">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
