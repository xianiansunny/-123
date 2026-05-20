import { useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Terminal, 
  Palette, 
  Download, 
  RefreshCw, 
  Image as ImageIcon,
  AlertCircle,
  Code,
  Upload,
  FileText
} from "lucide-react";

const STYLES = [
  { id: "cyberpunk", name: "赛博朋克 (Cyberpunk)", prompt: "Futuristic neon city, high contrast, rainy night, cyberpunk aesthetic, detailed reflections." },
  { id: "ghibli", name: "吉卜力 (Studio Ghibli)", prompt: "Hand-drawn animation style, vibrant watercolors, serene and magical, Studio Ghibli inspired." },
  { id: "vaporwave", name: "蒸汽波 (Vaporwave)", prompt: "90s digital aesthetic, pastel pinks and purples, glitch art, retro-futurism, lo-fi." },
  { id: "oil", name: "古典油画 (Oil Painting)", prompt: "Classical oil painting, rich textures, dramatic lighting, Rembrandt style, visible brushstrokes." },
  { id: "pixel", name: "像素艺术 (Pixel Art)", prompt: "Crisp 16-bit pixel art, vibrant colors, retro game aesthetic, detailed sprite work." },
  { id: "blueprint", name: "工程蓝图 (Blueprint)", prompt: "Architectural blueprint, white lines on blue background, technical drafting style, precise." },
  { id: "origami", name: "折纸艺术 (Origami)", prompt: "Intricate paper folding, minimalist, soft shadows, 3D paper texture, clean aesthetic." },
  { id: "dark_fantasy", name: "黑暗奇幻 (Dark Fantasy)", prompt: "Epic dark fantasy illustration, moody, gothic, intricate armor and magic, cinematic lighting." },
];

export default function App() {
  const [ascii, setAscii] = useState("");
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [customStyle, setCustomStyle] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [showStyles, setShowStyles] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://api.nuwaflux.com/v1");
  const [modelId, setModelId] = useState("gemini-3.1-flash-image-preview");
  const [quality, setQuality] = useState("standard");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setAscii(content);
    };

    // Attempt to read as text regardless of type, limited to 1MB to avoid performance issues
    if (file.size > 1024 * 1024) {
      setError("文件过大 (最大 1MB)");
      return;
    }
    
    reader.readAsText(file);
    // Reset input so the same file can be uploaded again if needed
    e.target.value = "";
  };

  const generateImage = async () => {
    if (!ascii.trim()) {
      setError("请输入一些 ASCII 字符画");
      return;
    }

    setLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ascii,
          style: customStyle || selectedStyle.prompt,
          aspectRatio,
          quality,
          apiConfig: {
            apiKey,
            baseUrl,
            modelId,
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "生成失败");
      }

      setResultImage(data.imageUrl);
    } catch (err: any) {
      setError(err.message || "连接服务器失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `ascii-art-${Date.now()}.png`;
    link.click();
  };

  return (
    <div id="ascii-app" className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans selection:bg-blue-600/10">
      {/* Header */}
      <header className="flex items-center justify-between px-8 h-16 bg-white border-b border-blue-50 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-200">
             <span className="text-white font-bold text-xs tracking-tighter">A:V</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight">ASCII <span className="text-blue-400 font-normal">艺术生成器</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors underline-offset-4 decoration-1 decoration-gray-200">历史记录</a>
          <a href="#" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors underline-offset-4 decoration-1 decoration-gray-200">使用文档</a>
          <button className="px-5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-full hover:bg-blue-700 transition-all shadow-sm">
            版本 V 1.2.0
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-64px)]">
        
        {/* Sidebar: Style selection */}
        <aside className="lg:col-span-3 flex flex-col gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-y-auto">
          {/* API Settings Section */}
          <div className={`rounded-xl transition-all border ${showApiSettings ? 'bg-blue-50/30 border-blue-100 p-4' : 'bg-white border-transparent'}`}>
            <button 
              onClick={() => setShowApiSettings(!showApiSettings)}
              className="flex items-center justify-between w-full text-[11px] font-bold uppercase tracking-wider transition-colors group"
            >
              <div className="flex items-center gap-2 text-gray-400 group-hover:text-blue-600">
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                <span>接口配置 (API Settings)</span>
              </div>
              <div className={`px-2 py-0.5 rounded text-[9px] ${apiKey ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {apiKey ? '已配置' : '需配置'}
              </div>
            </button>
            
            {showApiSettings && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mt-4 space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">NUWA API Key</label>
                  <input
                    type="password"
                    placeholder="在此输入您的 sk-..."
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2 text-xs focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  {!apiKey && <p className="text-[9px] text-blue-600">※ 请输入密钥以启动渲染引擎</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Base URL</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2 text-xs focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Model ID</label>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2 text-xs focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5"
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                  />
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">视觉风格 (Style Engine)</label>
              <div className="relative group">
                <div 
                  onClick={() => setShowStyles(!showStyles)}
                  className={`w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-medium flex items-center justify-between cursor-pointer transition-all hover:bg-white hover:border-blue-200 focus:ring-4 focus:ring-blue-500/5 ${showStyles ? 'border-blue-600 ring-4 ring-blue-500/5 bg-white' : ''}`}
                >
                  <span className="truncate">{selectedStyle.name}</span>
                  <Palette size={14} className={`transition-colors ${showStyles ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>

                <AnimatePresence>
                  {showStyles && (
                    <>
                      {/* Overlay to close menu when clicking outside */}
                      <div 
                        className="fixed inset-0 z-[60]" 
                        onClick={() => setShowStyles(false)}
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 right-0 mt-2 p-2 bg-white border border-blue-50 rounded-2xl shadow-xl z-[70] max-h-[300px] overflow-y-auto scrollbar-hide"
                      >
                        {STYLES.map((style) => (
                          <div
                            key={style.id}
                            onClick={() => {
                              setSelectedStyle(style);
                              setCustomStyle("");
                              setShowStyles(false);
                            }}
                            className={`px-4 py-3 rounded-xl text-xs font-medium cursor-pointer transition-all mb-1 last:mb-0 ${
                              selectedStyle.id === style.id 
                                ? "bg-blue-600 text-white shadow-sm shadow-blue-200" 
                                : "hover:bg-blue-50 text-gray-600 hover:text-blue-600"
                            }`}
                          >
                            {style.name}
                          </div>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">生成质量 (Clarity)</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "standard", name: "标准" },
                  { id: "hd", name: "高清" },
                  { id: "ultra", name: "超清" }
                ].map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setQuality(q.id)}
                    className={`py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest border transition-all ${
                      quality === q.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                        : "bg-white border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-600"
                    }`}
                  >
                    {q.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 font-sans">当前生效提示词 (Effective Prompt)</h3>
                  {!customStyle && (
                    <button 
                      onClick={() => setCustomStyle(selectedStyle.prompt)}
                      className="text-[9px] text-blue-500 hover:text-blue-600 transition-colors uppercase font-bold flex items-center gap-1"
                    >
                      <Code size={10} /> 修改此模板
                    </button>
                  )}
                </div>
                <div className="p-3 bg-blue-50/30 border border-blue-100 rounded-xl text-[11px] text-blue-800/70 leading-relaxed italic font-serif">
                  "{customStyle || selectedStyle.prompt}"
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-300">自定义覆盖 (Custom Override)</h3>
                  {customStyle && (
                    <button 
                      onClick={() => setCustomStyle("")}
                      className="text-[9px] text-gray-400 hover:text-blue-600 transition-colors uppercase font-bold"
                    >
                      还原预设
                    </button>
                  )}
                </div>
                <textarea
                  placeholder="在此输入自定义提示词以覆盖引擎预设..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-xs min-h-[80px] focus:outline-none focus:border-blue-600 transition-colors placeholder:text-gray-300 resize-none"
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
                />
              </div>
              
              <div className="space-y-3 pt-2">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-gray-300">画幅比例</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["1:1", "4:3", "16:9", "9:16"].map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                        aspectRatio === ratio
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                          : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <button
              disabled={loading}
              onClick={generateImage}
              className={`w-full py-4 rounded-2xl font-bold uppercase tracking-[0.1em] text-sm flex items-center justify-center gap-3 transition-all shadow-lg ${
                loading 
                  ? "bg-blue-100 text-blue-300 cursor-not-allowed shadow-none" 
                  : "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={16} />
              ) : (
                <Sparkles size={16} />
              )}
              {loading ? "处理中..." : "渲染艺术"}
            </button>
          </div>
        </aside>

        {/* Input Area */}
        <section className="lg:col-span-4 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <Terminal size={12} className="text-gray-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">ASCII 源码</span>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".txt,.json,.fbx" 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors"
                title="支持 .txt, .json, .fbx"
              >
                <Upload size={12} />
                导入文件
              </button>
              <div className="w-px h-3 bg-gray-100"></div>
              <span className="text-[10px] text-gray-300 font-mono">字数: {ascii.length}</span>
            </div>
          </div>
          
          <div className="p-6 flex-1 flex flex-col bg-gray-50/50">
            <textarea
              id="ascii-input"
              className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-6 font-mono text-[11px] leading-tight text-gray-600 resize-none focus:outline-none focus:border-blue-600 transition-all placeholder:text-blue-400/50 scrollbar-hide"
              placeholder={`
███████       ████████████████
███████                      ████
███████                        ███
███████                        ███
███████                        ███
███████                      ████
███████       ████████████████
███████                      ████
███████                        ███
███████                        ███
███████                        ███
███████                      ████
███████       ████████████████
              `}
              value={ascii}
              onChange={(e) => setAscii(e.target.value)}
            />
            
            <div className="mt-4 flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-gray-400 px-1">
               <button 
                onClick={() => setAscii("")}
                className="hover:text-blue-600 transition-colors"
               >
                清空内容
               </button>
               <span className="text-gray-300">支持拖拽 .txt / .json / .fbx</span>
            </div>
          </div>
        </section>

        {/* Output Area */}
        <section className="lg:col-span-5 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ImageIcon size={12} className="text-gray-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">生成画布</span>
            </div>
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${loading ? "bg-amber-400 animate-pulse" : resultImage ? "bg-green-500" : "bg-gray-200"}`}></div>
               <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                {loading ? "正在渲染" : resultImage ? "转换完成" : "等待中"}
               </span>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-200 rounded-2xl relative overflow-hidden flex items-center justify-center group shadow-inner border border-gray-50 min-h-[400px]">
              <AnimatePresence mode="wait">
                {!resultImage && !loading && !error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center px-10"
                  >
                    <p className="text-gray-400 text-xs font-mono mb-4 tracking-tighter max-w-xs leading-relaxed capitalize">
                      系统已就绪。请提供 ASCII 字符源码并选择喜欢的视觉风格引擎。
                    </p>
                    <div className="h-[1px] w-8 bg-gray-200 mx-auto"></div>
                  </motion.div>
                )}

                {loading && (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px]"
                  >
                    <div className="w-12 h-12 relative">
                        <div className="absolute inset-0 border border-blue-100 rounded-full"></div>
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                          className="absolute inset-0 border-t border-blue-600 rounded-full"
                        />
                    </div>
                    <p className="mt-6 text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] animate-pulse">
                      正在合成影像
                    </p>
                  </motion.div>
                )}

                {error && (
                  <motion.div 
                    key="error"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center p-8 text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
                      <AlertCircle size={20} className="text-red-400" />
                    </div>
                    <p className="text-gray-900 font-semibold text-sm mb-1">渲染过程中遇到错误</p>
                    <p className="text-gray-400 text-[11px] mb-4">{error}</p>
                    <button 
                      onClick={() => setError(null)}
                      className="px-4 py-2 border border-blue-100 rounded-lg text-[10px] font-bold text-blue-600 hover:bg-blue-50 transition-colors uppercase tracking-widest"
                    >
                      忽略
                    </button>
                  </motion.div>
                )}

                {resultImage && (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full h-full flex flex-col items-center justify-center p-4"
                  >
                    <img 
                      src={resultImage} 
                      alt="Generated Art" 
                      className="max-h-full max-w-full rounded-xl shadow-2xl object-contain border border-white"
                      referrerPolicy="no-referrer"
                    />
                    
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                       <div className="max-w-[70%]">
                          <p className="text-[11px] text-blue-500 italic mb-2 font-serif bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/30 backdrop-saturate-150">
                            "{customStyle || selectedStyle.name} 基于源字符的影像解读。"
                          </p>
                          <div className="h-[2px] w-12 bg-blue-600"></div>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <button 
                onClick={handleDownload}
                disabled={!resultImage}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-blue-50 border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed group transition-all"
              >
                <Download size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-widest">下载保存</span>
              </button>
              <button 
                onClick={generateImage}
                disabled={!resultImage || loading}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-blue-50 border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed group transition-all"
              >
                <RefreshCw size={16} className={`text-gray-400 group-hover:text-blue-600 transition-colors ${loading ? "animate-spin" : ""}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest">生成变体</span>
              </button>
              <button 
                disabled={!resultImage}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-blue-50 border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed group transition-all"
              >
                <Sparkles size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-widest">高清放大</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-[1600px] mx-auto px-8 py-6 mb-4 flex items-center justify-between text-gray-400 text-[10px] uppercase tracking-[0.2em] font-medium border-t border-gray-100/50">
        <div className="flex gap-10">
          <span>V1.2.0 稳定版推理引擎</span>
          <span className="flex items-center gap-2">
            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
            系统状态：运行正常
          </span>
        </div>
        <div className="flex gap-8">
          <span className="hover:text-blue-600 cursor-pointer transition-colors">安全准则</span>
          <span className="hover:text-blue-600 cursor-pointer transition-colors">API 接口</span>
          <span>© 2024 ASCII CANVAS PRO</span>
        </div>
      </footer>
    </div>
  );
}
