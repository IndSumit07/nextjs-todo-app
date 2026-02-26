"use client";

import { useState, useEffect } from "react";
import {
  Code2,
  ExternalLink,
  Plus,
  Loader2,
  ChevronRight,
  Terminal,
  Trophy,
  CheckCircle2,
  AlignLeft,
  Settings,
  Search,
  BookOpen,
  X,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { clsx } from "clsx";
import Editor from "@monaco-editor/react";

export default function LeetCodePage() {
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [userCode, setUserCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [saving, setSaving] = useState(false);
  const [showProblemList, setShowProblemList] = useState(false);

  useEffect(() => {
    fetchSavedProblems();
  }, []);

  const fetchSavedProblems = async () => {
    try {
      const res = await axios.get("/api/leetcode");
      if (res.data.success) {
        setProblems(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch problems");
    }
  };

  const handleFetch = async () => {
    if (!url) return;
    setFetching(true);
    try {
      const res = await axios.post("/api/leetcode/fetch", { url });
      if (res.data.success) {
        const problemData = res.data.data;
        const saveRes = await axios.post("/api/leetcode", problemData);
        if (saveRes.data.success) {
          setProblems([saveRes.data.data, ...problems]);
          setSelectedProblem(saveRes.data.data);
          setUserCode("");
          setLanguage("javascript");
          setUrl("");
          toast.success("Problem fetched and saved!");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch problem");
    } finally {
      setFetching(false);
    }
  };

  const handleSaveCode = async () => {
    if (!selectedProblem) return;
    setSaving(true);
    try {
      await axios.put(`/api/leetcode/${selectedProblem._id}`, {
        userCode,
        language,
      });
      setProblems(
        problems.map((p) =>
          p._id === selectedProblem._id ? { ...p, userCode, language } : p,
        ),
      );
      toast.success("Solution saved!");
    } catch (error) {
      toast.error("Failed to save code");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500 relative pb-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-[#FFA116] p-2 rounded-lg">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            LeetCode Hub
          </h1>

          <button
            onClick={() => setShowProblemList(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm ml-4"
          >
            <BookOpen className="h-4 w-4" />
            My Solutions
            <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px] ml-1">
              {problems.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-4 bg-white p-1.5 pl-4 rounded-xl border border-gray-200 shadow-sm w-96">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Paste problem URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          <button
            onClick={handleFetch}
            disabled={fetching || !url}
            className="bg-black text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            {fetching ? <Loader2 className="h-3 w-3 animate-spin" /> : "Fetch"}
          </button>
        </div>
      </header>

      <div className="h-[calc(100vh-180px)] min-h-[600px] flex gap-4 transition-all duration-300">
        {/* Problem Overlay List (Drawer style) */}
        {showProblemList && (
          <div className="fixed inset-0 z-[100] flex">
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowProblemList(false)}
            />
            <div className="relative w-80 bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-left duration-300 border-r border-gray-100">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="font-bold text-sm">Solved Problems</h2>
                <button
                  onClick={() => setShowProblemList(false)}
                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {problems.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => {
                      setSelectedProblem(p);
                      setUserCode(p.userCode || "");
                      setLanguage(p.language || "javascript");
                      setShowProblemList(false);
                    }}
                    className={clsx(
                      "w-full text-left p-4 rounded-xl transition-all group border",
                      selectedProblem?._id === p._id
                        ? "bg-black border-black text-white"
                        : "bg-white border-transparent text-gray-600 hover:bg-gray-50",
                    )}
                  >
                    <p
                      className={clsx(
                        "text-[9px] font-bold uppercase mb-1",
                        selectedProblem?._id === p._id
                          ? "text-white/60"
                          : p.difficulty === "Easy"
                            ? "text-green-500"
                            : p.difficulty === "Medium"
                              ? "text-orange-500"
                              : "text-red-500",
                      )}
                    >
                      {p.difficulty}
                    </p>
                    <h3 className="text-xs font-bold truncate">{p.title}</h3>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Full Width Workspace */}
        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {selectedProblem ? (
            <>
              {/* Workspace Header */}
              <div className="h-12 bg-[#fafafa] border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center h-full">
                  <div className="flex items-center gap-2 border-b-2 border-black h-full px-4 cursor-default">
                    <AlignLeft className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Description
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 h-full px-4 hover:text-gray-600 cursor-pointer">
                    <Code2 className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Editorial
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveCode}
                    disabled={saving}
                    className="bg-[#2cbb5d] hover:bg-[#27a04f] text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    Save Solution
                  </button>
                </div>
              </div>

              {/* Main Split */}
              <div className="flex-1 flex overflow-hidden">
                {/* Scrollable Description Side */}
                <div className="w-[45%] overflow-y-auto p-8 border-r border-gray-100 custom-scrollbar bg-white">
                  <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-[#262626] mb-2">
                      {selectedProblem.title}
                    </h2>
                    <div className="flex items-center gap-2 mb-8">
                      <span
                        className={clsx(
                          "text-xs font-bold px-2.5 py-1 rounded-full",
                          selectedProblem.difficulty === "Easy"
                            ? "bg-green-50 text-green-600"
                            : selectedProblem.difficulty === "Medium"
                              ? "bg-orange-50 text-orange-600"
                              : "bg-red-50 text-red-600",
                        )}
                      >
                        {selectedProblem.difficulty}
                      </span>
                      <a
                        href={selectedProblem.url}
                        target="_blank"
                        className="text-gray-300 hover:text-black transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: selectedProblem.content,
                      }}
                      className="leetcode-content prose prose-zinc max-w-none text-[14px] leading-relaxed text-[#262626]"
                    />
                  </div>
                </div>

                {/* Editor Side */}
                <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                  <div className="h-10 bg-[#2d2d2d] border-b border-[#3e3e3e] flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-[#3e3e3e] text-gray-200 text-[11px] font-bold outline-none border-none rounded px-2 py-1 hover:bg-[#4e4e4e] cursor-pointer"
                      >
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="c">C</option>
                      </select>
                    </div>
                    <Settings className="h-3.5 w-3.5 text-gray-500 hover:text-gray-300 cursor-pointer" />
                  </div>
                  <div className="flex-1 overflow-hidden relative">
                    <Editor
                      height="100%"
                      language={language}
                      theme="vs-dark"
                      value={userCode}
                      onChange={(val) => setUserCode(val || "")}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily:
                          "'Fira Code', 'Cascadia Code', Consolas, monospace",
                        fontLigatures: true,
                        cursorStyle: "line",
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 20 },
                        renderLineHighlight: "all",
                        scrollbar: {
                          verticalScrollbarSize: 8,
                          horizontalScrollbarSize: 8,
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full bg-white flex flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <Code2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Select a problem to start
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Fetch a new problem using the URL bar or click{" "}
                <span className="font-bold text-black">'My Solutions'</span>.
              </p>
              <button
                onClick={() => setShowProblemList(true)}
                className="mt-6 flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-black/10 hover:opacity-90 transition-all"
              >
                <BookOpen className="h-4 w-4" />
                View All Problems
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }

        .leetcode-content pre {
          background-color: #f7f9fa !important;
          padding: 1.25rem !important;
          border-radius: 0.5rem !important;
          font-family: "Fira Code", monospace !important;
          font-size: 13px !important;
          color: #263238 !important;
          margin: 1.5rem 0 !important;
          border: 1px solid #edf0f2 !important;
          overflow-x: auto;
        }
        .leetcode-content code {
          background-color: #f7f9fa;
          padding: 0.2rem 0.4rem;
          border-radius: 0.3rem;
          font-family: inherit;
        }
        .leetcode-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .leetcode-content p {
          margin: 1rem 0;
        }
        .leetcode-content strong {
          font-weight: 700;
          color: #000;
        }
      `}</style>
    </div>
  );
}
