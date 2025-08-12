import { useState, useRef, useEffect } from "react";

export default function App() {
  // === States ===
  const [pages, setPages] = useState([""]); // each page's text
  const [currentPage, setCurrentPage] = useState(0); // current page index
  const [currentSceneryIndex, setCurrentSceneryIndex] = useState(0);
  const [currentMusicIndex, setCurrentMusicIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [widgetVisible, setWidgetVisible] = useState(true);
  const [maxHeight, setMaxHeight] = useState(0);

  // === Refs ===
  const measureRef = useRef(null);
  const containerRef = useRef(null);
  const audioRef = useRef(null);

  // === Constants ===
  const arrowWidth = 40;
  const arrowHeight = 40;

  const sceneryVideos = [
    "images/background.mp4",
    "images/background2.mp4",
    "images/background3.mp4",
    "images/background4.mp4",
    "images/background5.mp4",
  ];

  const musicTracks = [
    "music/track1.mp3",
    "music/track2.mp3",
    "music/track3.mp3",
    "music/track4.mp3",
    "music/track5.mp3",
    "music/track6.mp3",
  ];

  // === Effects ===
  // Update maxHeight when container or window size changes
  useEffect(() => {
    function updateMaxHeight() {
      if (containerRef.current) {
        const textarea = containerRef.current.querySelector("textarea");
        if (textarea) setMaxHeight(textarea.clientHeight);
      }
    }
    updateMaxHeight();
    window.addEventListener("resize", updateMaxHeight);
    return () => window.removeEventListener("resize", updateMaxHeight);
  }, []);

  // Play/pause music based on isMusicPlaying or track change
  useEffect(() => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isMusicPlaying, currentMusicIndex]);

  // === Handlers ===
  const updatePageText = (text) => {
    setPages((prev) => {
      const updated = [...prev];
      updated[currentPage] = text;
      return updated;
    });
  };

  const handleChange = (e) => {
    let newValue = e.target.value;
    const trailingSpacesMatch = newValue.match(/\s+$/);

    if (trailingSpacesMatch) {
      newValue = newValue.trimEnd() + " ";
    } else {
      newValue = newValue.trimEnd();
    }

    const isDeleting = newValue.length < pages[currentPage].length;

    if (!measureRef.current || isDeleting) {
      updatePageText(newValue);
      return;
    }

    measureRef.current.textContent = newValue || " ";
    const textHeight = measureRef.current.offsetHeight;

    if (textHeight > maxHeight) return;
    if (textHeight === maxHeight && /\s$/.test(newValue) && !isDeleting) return;

    updatePageText(newValue);
  };

  const goNextPage = () => {
    if (currentPage === pages.length - 1) {
      if (pages.length < 100) {
        setPages((prev) => [...prev, ""]);
        setCurrentPage(currentPage + 1);
      }
    } else {
      setCurrentPage(currentPage + 1);
    }
  };

  const goPrevPage = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  const copyCurrentPage = async () => {
    try {
      await navigator.clipboard.writeText(pages[currentPage]);
      alert("Current page copied to clipboard!");
    } catch {
      alert("Failed to copy current page.");
    }
  };

  const copyWholeBook = async () => {
    try {
      const fullText = pages
        .map((pageText, i) => `Page ${i + 1}:\n${pageText}\n`)
        .join("\n");
      await navigator.clipboard.writeText(fullText);
      alert("Whole book copied to clipboard!");
    } catch {
      alert("Failed to copy the book.");
    }
  };

  const changeScenery = () => {
    setCurrentSceneryIndex((prev) => (prev + 1) % sceneryVideos.length);
  };

  const changeMusic = () => {
    setCurrentMusicIndex((prev) => (prev + 1) % musicTracks.length);
    setIsMusicPlaying(true);
  };

  const toggleMusicPlay = () => {
    setIsMusicPlaying((prev) => !prev);
  };

  const toggleWidgetVisibility = () => {
    setWidgetVisible((prev) => !prev);
  };

  // === Render ===
  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-black">
      {/* Background video */}
      <video
        key={sceneryVideos[currentSceneryIndex]}
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={sceneryVideos[currentSceneryIndex]} type="video/mp4" />
      </video>

      {/* Background music */}
      <audio
        ref={audioRef}
        src={musicTracks[currentMusicIndex]}
        loop
        autoPlay
        controls={false}
      />

      {/* Bottom-left controls */}
      <div className="fixed bottom-4 left-4 z-20 flex flex-col gap-2">
        <button
          onClick={toggleWidgetVisibility}
          style={{ fontFamily: "MinecraftRegular", color: "white" }}
          className="minecraft-btn p-1 border-2 border-b-4 hover:text-yellow-200"
        >
          {widgetVisible ? "Hide Widget" : "Show Widget"}
        </button>

        {widgetVisible && (
          <>
            <button
              onClick={changeScenery}
              style={{ fontFamily: "MinecraftRegular", color: "white" }}
              className="minecraft-btn p-1 border-2 border-b-4 hover:text-yellow-200"
            >
              Change Scenery
            </button>
            <button
              onClick={changeMusic}
              style={{ fontFamily: "MinecraftRegular", color: "white" }}
              className="minecraft-btn p-1 border-2 border-b-4 hover:text-yellow-200"
            >
              Change Music
            </button>
            <button
              onClick={toggleMusicPlay}
              style={{ fontFamily: "MinecraftRegular", color: "white" }}
              className="minecraft-btn p-1 border-2 border-b-4 hover:text-yellow-200"
            >
              {isMusicPlaying ? "Pause Music" : "Play Music"}
            </button>
          </>
        )}
      </div>

      {/* Main container */}
      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-md mx-auto select-none"
        style={{ userSelect: "text" }}
      >
        <div className="relative flex justify-center items-center w-full">
          <img
            src="images/book.png"
            alt="Minecraft Book"
            className="w-[70%] h-auto"
            draggable={false}
          />

          {currentPage > 0 && (
            <button
              type="button"
              aria-label="Previous Page"
              className="absolute bottom-[7%] left-[24%] p-0 bg-transparent border-none cursor-pointer"
              style={{ width: arrowWidth, height: arrowHeight, zIndex: 20 }}
              onClick={goPrevPage}
            >
              <img
                src="images/page_backward.png"
                alt="Previous Page"
                className="w-full h-full"
                draggable={false}
                onMouseEnter={(e) =>
                  (e.currentTarget.src = "images/page_backward_highlighted.png")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.src = "images/page_backward.png")
                }
              />
            </button>
          )}

          <button
            type="button"
            aria-label="Next Page"
            className="absolute bottom-[7%] right-[28%] p-0 bg-transparent border-none cursor-pointer"
            style={{ width: arrowWidth, height: arrowHeight, zIndex: 20 }}
            onClick={goNextPage}
          >
            <img
              src="images/page_forward.png"
              alt="Next Page"
              className="w-full h-full"
              draggable={false}
              onMouseEnter={(e) =>
                (e.currentTarget.src = "images/page_forward_highlighted.png")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.src = "images/page_forward.png")
              }
            />
          </button>
        </div>

        <div
          style={{ fontFamily: "MinecraftRegular" }}
          className="absolute top-[8%] right-[25%] text-black text-[1.25rem] select-none pointer-events-none"
        >
          Page {currentPage + 1} of {pages.length}
        </div>

        <textarea
          value={pages[currentPage]}
          onChange={handleChange}
          spellCheck={false}
          style={{
            fontFamily: "MinecraftRegular",
            lineHeight: "1.25rem",
            padding: "0.75rem",
          }}
          className="absolute top-[12.3%] left-[21%] w-[58%] h-[64%] bg-transparent text-black text-[1.125rem] resize-none outline-none overflow-hidden whitespace-pre-wrap break-words"
        />

        <div
          ref={measureRef}
          style={{
            fontFamily: "MinecraftRegular",
            lineHeight: "1.25rem",
            padding: "0.75rem",
          }}
          className="absolute top-0 left-0 w-[58%] text-[1.125rem] whitespace-pre-wrap break-words invisible pointer-events-none select-none"
        />

        <div className="flex justify-center mt-4 space-x-4">
          <button
            onClick={copyCurrentPage}
            style={{ fontFamily: "MinecraftRegular" }}
            className="minecraft-btn w-30 text-center text-white truncate p-1 border-2 border-b-4 hover:text-yellow-200"
          >
            Copy Page
          </button>
          <button
            onClick={copyWholeBook}
            style={{ fontFamily: "MinecraftRegular" }}
            className="minecraft-btn w-30 text-center text-white truncate p-1 border-2 border-b-4 hover:text-yellow-200"
          >
            Copy Book
          </button>
          {/* Bottom-right LinkedIn Button */}
<div className="fixed bottom-4 right-4 z-20">
  <button
    onClick={() => window.open("https://www.linkedin.com/in/mohammed-al-anii/", "_blank")}
    style={{ fontFamily: "MinecraftRegular", color: "white" }}
    className="minecraft-btn p-1 border-2 border-b-4 hover:text-yellow-200"
  >
    Visit Me
  </button>
</div>

        </div>
      </div>
    </div>
  );
}
