
import React from 'react';
import { Instagram, ShoppingCart, Share2, ExternalLink } from 'lucide-react';

const INSTAGRAM_URL = 'https://www.instagram.com/donattodeportivook/';
const MERCADOLIBRE_URL = 'https://listado.mercadolibre.com.ar/_CustId_123456789'; // Replace with actual ID

export const MerchView: React.FC = () => {

  const handleShare = async (title: string, url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      // Simple feedback could be added here, but keeping it minimal
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center mb-8">
         <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Tienda Oficial</h2>
         <p className="text-gray-500 text-sm">Equipamiento de alta calidad para tu entrenamiento.</p>
      </div>

      {/* Instagram Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group transition-all hover:shadow-md">
         {/* Cover Image (Collage) */}
         <div className="h-32 bg-black relative grid grid-cols-3 gap-0.5 overflow-hidden">
            <div className="relative h-full w-full overflow-hidden">
                <img
                    src="https://placehold.co/200x200/1a1a1a/ffffff?text=Training"
                    alt="Training Post"
                    className="w-full h-full object-cover opacity-90 hover:scale-110 transition-transform duration-700"
                />
            </div>
            <div className="relative h-full w-full overflow-hidden">
                <img
                    src="https://placehold.co/200x200/262626/ffffff?text=Tips"
                    alt="Tips Post"
                    className="w-full h-full object-cover opacity-90 hover:scale-110 transition-transform duration-700 delay-75"
                />
            </div>
            <div className="relative h-full w-full overflow-hidden">
                 <img
                    src="https://placehold.co/200x200/000000/ffffff?text=Gear"
                    alt="Gear Post"
                    className="w-full h-full object-cover opacity-90 hover:scale-110 transition-transform duration-700 delay-150"
                />
            </div>

            <button
                onClick={() => handleShare('Donatto Instagram', INSTAGRAM_URL)}
                className="absolute top-3 right-3 z-10 bg-black/30 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/50 transition-colors"
            >
                <Share2 size={16} />
            </button>
         </div>

         <div className="px-6 pb-6 relative">
             {/* Profile Icon */}
             <div className="absolute -top-8 left-6 bg-black text-white p-3 rounded-xl border-4 border-white shadow-lg z-20">
                <Instagram size={24} />
             </div>

             <div className="mt-10">
                 <h3 className="text-xl font-black uppercase tracking-tight">Instagram Shop</h3>
                 <p className="text-xs text-gray-500 mt-1 font-medium">Novedades, comunidad y ofertas exclusivas.</p>
             </div>

             <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-[0.98]"
             >
                Abrir Instagram <ExternalLink size={14} />
             </a>
         </div>
      </div>

      {/* Mercado Libre Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group transition-all hover:shadow-md">
         {/* Cover Image */}
         <div className="h-32 bg-yellow-400 relative overflow-hidden">
            <img
                src="https://placehold.co/600x200/facc15/000000?text=New+Collection"
                alt="Mercado Libre Store"
                className="w-full h-full object-cover opacity-80 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
            />
            <button
                onClick={() => handleShare('Tienda MercadoLibre', MERCADOLIBRE_URL)}
                className="absolute top-3 right-3 bg-black/10 backdrop-blur-md p-2 rounded-full text-black hover:bg-black/20 transition-colors"
            >
                <Share2 size={16} />
            </button>
         </div>

         <div className="px-6 pb-6 relative">
             {/* Profile Icon */}
             <div className="absolute -top-8 left-6 bg-yellow-400 text-black p-3 rounded-xl border-4 border-white shadow-lg">
                <ShoppingCart size={24} />
             </div>

             <div className="mt-10">
                 <h3 className="text-xl font-black uppercase tracking-tight">Mercado Libre</h3>
                 <p className="text-xs text-gray-500 mt-1 font-medium">Compra segura, envíos a todo el país.</p>
             </div>

             <a
                href={MERCADOLIBRE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full flex items-center justify-center gap-2 border-2 border-black text-black py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-all active:scale-[0.98]"
             >
                Ir a MercadoLibre <ExternalLink size={14} />
             </a>
         </div>
      </div>
    </div>
  );
};
