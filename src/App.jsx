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
  const [hasStarted, setHasStarted] = useState(false); // splash screen state

  // === Refs ===
  const measureRef = useRef(null);
  const containerRef = useRef(null);
  const audioRef = useRef(null);
  const textareaRef = useRef(null);

  // === Constants ===
  const arrowWidth = 40;
  const arrowHeight = 40;

  const sceneryVideos = [
    "https://www.dropbox.com/scl/fi/1tbqxz8xioelcak18g0gw/background.mp4?rlkey=07fiwtvr1ktqo2yyai9g81bnh&st=wmduauv8&raw=1",
    "https://www.dropbox.com/scl/fi/e58n16oor3kzolheoxxn5/background2.mp4?rlkey=8m27bxjh42mugbbxtsz6e06g5&st=q183oibf&raw=1",
    "https://www.dropbox.com/scl/fi/zzrjuq91acje6tfeezufs/background3.mp4?rlkey=7e4xrpmyndrhsuhu4qo1isizk&st=96z2ukhq&raw=1",
    "https://www.dropbox.com/scl/fi/vnh6h80hxm0fpyj7tutvp/background4.mp4?rlkey=z1xcas6a3hoqb4kommvv9qlvz&st=9jyalcc7&raw=1",
    "https://www.dropbox.com/scl/fi/vnh6h80hxm0fpyj7tutvp/background4.mp4?rlkey=z1xcas6a3hoqb4kommvv9qlvz&st=9jyalcc7&raw=1",
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
    if (!hasStarted) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const updateMaxHeight = () => {
      const style = window.getComputedStyle(textarea);
      const paddingY =
        parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const innerHeight = textarea.clientHeight - paddingY;
      if (innerHeight > 0) setMaxHeight(innerHeight);
    };

    // Run once immediately and once on next frame to catch layout
    updateMaxHeight();
    const raf = requestAnimationFrame(updateMaxHeight);

    const ro = new ResizeObserver(updateMaxHeight);
    ro.observe(textarea);
    window.addEventListener("resize", updateMaxHeight);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", updateMaxHeight);
    };
  }, [hasStarted]);

  // Play/pause music based on isMusicPlaying or track change
  useEffect(() => {
    if (!audioRef.current || !hasStarted) return;
    if (isMusicPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isMusicPlaying, currentMusicIndex, hasStarted]);

  // === Handlers ===
  const startExperience = () => {
    setHasStarted(true);
    // Try to start music after user interaction (satisfies autoplay policy)
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    }, 100);
  };

  const updatePageText = (text) => {
    setPages((prev) => {
      const updated = [...prev];
      updated[currentPage] = text;
      return updated;
    });
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    const isDeleting = newValue.length < pages[currentPage].length;

    // Always allow deletion
    if (isDeleting) {
      updatePageText(newValue);
      return;
    }

    // If we can't measure yet, just allow the input
    if (!measureRef.current || maxHeight === 0) {
      updatePageText(newValue);
      return;
    }

    // Measure the proposed new content
    measureRef.current.textContent = newValue || " ";
    const textHeight = measureRef.current.offsetHeight;

    // Reject only if it would overflow the page
    if (textHeight > maxHeight) return;

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
        preload="auto"
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={sceneryVideos[currentSceneryIndex]} type="video/mp4" />
      </video>

      {/* Background music */}
      <audio
        ref={audioRef}
        src={musicTracks[currentMusicIndex]}
        loop
        controls={false}
      />

      {/* Splash / start screen */}
      {!hasStarted && (
        <div
          onClick={startExperience}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer"
        >
          <div
            style={{ fontFamily: "MinecraftRegular" }}
            className="text-white text-4xl mb-6 drop-shadow-lg"
          >
            Minecraft Book
          </div>
          <button
            onClick={startExperience}
            style={{ fontFamily: "MinecraftRegular", color: "white" }}
            className="minecraft-btn px-6 py-2 border-2 border-b-4 hover:text-yellow-200 text-xl"
          >
            Open Book
          </button>
          <div
            style={{ fontFamily: "MinecraftRegular" }}
            className="text-white/70 text-sm mt-6"
          >
            Click anywhere to begin
          </div>
        </div>
      )}

      {/* Bottom-left controls */}
      {hasStarted && (
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
      )}

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
          ref={textareaRef}
          value={pages[currentPage]}
          onChange={handleChange}
          spellCheck={false}
          style={{
            fontFamily: "MinecraftRegular",
            lineHeight: "1.25rem",
            padding: "0.75rem",
            boxSizing: "border-box",
          }}
          className="absolute top-[12.3%] left-[21%] w-[58%] h-[64%] bg-transparent text-black text-[1.125rem] resize-none outline-none overflow-hidden whitespace-pre-wrap break-words"
        />

        <div
          ref={measureRef}
          style={{
            fontFamily: "MinecraftRegular",
            lineHeight: "1.25rem",
            padding: "0",
            width: textareaRef.current
              ? textareaRef.current.clientWidth -
                parseFloat(
                  window.getComputedStyle(textareaRef.current).paddingLeft
                ) -
                parseFloat(
                  window.getComputedStyle(textareaRef.current).paddingRight
                )
              : "58%",
            boxSizing: "content-box",
          }}
          className="absolute top-0 left-0 text-[1.125rem] whitespace-pre-wrap break-words invisible pointer-events-none select-none"
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
          {hasStarted && (
            <div className="fixed bottom-4 right-4 z-20">
              <button
                onClick={() =>
                  window.open(
                    "https://www.linkedin.com/in/mohammed-al-anii/",
                    "_blank"
                  )
                }
                style={{ fontFamily: "MinecraftRegular", color: "white" }}
                className="minecraft-btn p-1 border-2 border-b-4 hover:text-yellow-200"
              >
                Visit Me
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}