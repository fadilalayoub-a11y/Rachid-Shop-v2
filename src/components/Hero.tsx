export function Hero({ onShopNow }: { onShopNow: () => void }) {
  return (
    <div className="relative bg-gray-900 overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Fashion Header"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-gray-900/80 to-transparent" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:px-12 flex flex-col items-start">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-2xl leading-tight">
          اكتشف أحدث صيحات الموضة
        </h1>
        <p className="mt-6 text-xl text-gray-300 max-w-xl leading-relaxed">
          تشكيلة رائعة من الملابس والأحذية العصرية التي تناسب ذوقك وتمنحك إطلالة فريدة ومتميزة في كل مناسبة.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button 
            onClick={onShopNow}
            className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl active:scale-95 cursor-pointer"
          >
            تسوق الآن
          </button>
        </div>
      </div>
    </div>
  );
}
