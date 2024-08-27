import React, { useState, useEffect, useRef } from "react";
import { PlayIcon, PauseIcon, LayersIcon } from "lucide-react";

const CorrectionForm = ({ word, onSubmit, onCancel }) => {
  const [correction, setCorrection] = useState(word);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(correction);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-md shadow-lg w-64 absolute mt-1">
      <input
        type="text"
        value={correction}
        onChange={(e) => setCorrection(e.target.value)}
        className="bg-gray-700 text-white p-2 rounded-t-md w-full border-b border-gray-600"
        autoFocus
      />
      <div className="flex justify-end gap-2 p-2">
        <button
          onClick={handleSubmit}
          className="bg-yellow-500 text-black px-4 py-1 rounded-md text-sm font-medium"
        >
          Correct
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-700 text-white px-4 py-1 rounded-md text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const TranscriptEditor = ({ initialTranscript }) => {
  const [transcript, setTranscript] = useState(initialTranscript);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [correctionForm, setCorrectionForm] = useState(null);
  const intervalRef = useRef(null);

  const totalTime =
    transcript.length > 0
      ? transcript[transcript.length - 1].start_time +
        transcript[transcript.length - 1].duration
      : 0;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prevTime) => {
          if (prevTime + 100 >= totalTime) {
            clearInterval(intervalRef.current);
            setIsPlaying(false);
            return 0;
          }
          return prevTime + 100;
        });
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, totalTime]);

  const togglePlayPause = () => {
    if (currentTime >= totalTime) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleWordClick = (index, word) => {
    setCorrectionForm({
      index,
      word,
    });
  };

  const handleCorrection = (correctedWord) => {
    const newTranscript = [...transcript];
    newTranscript[correctionForm.index].word = correctedWord;
    setTranscript(newTranscript);
    setCorrectionForm(null);
  };

  const getHighlightStyle = (startTime, duration) => {
    if (currentTime >= startTime && currentTime < startTime + duration) {
      return "border text-white border-yellow-500 rounded-md";
    }
    return "text-white";
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${milliseconds.toString().slice(0, 1)}`;
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col  mb-4 ">
          <span className="text-gray-400">{formatTime(totalTime)}</span>
          <div className="flex mt-2 gap-2 items-center">
            <span className="bg-gray-700 text-white px-2 py-1 rounded text-sm">
              {(currentTime / 1000).toFixed(1)}s
            </span>
            <button
              onClick={togglePlayPause}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded"
            >
              {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
            </button>
            <LayersIcon size={16} className="text-gray-400" />
          </div>
        </div>
        <div className="space-y-2">
          {transcript.map((item, index) => (
            <span key={index} className="relative inline-block mr-2">
              <span
                className={`cursor-pointer ${getHighlightStyle(
                  item.start_time,
                  item.duration
                )}`}
                onClick={() => handleWordClick(index, item.word)}
              >
                {item.word}
              </span>
              {correctionForm && correctionForm.index === index && (
                <CorrectionForm
                  word={correctionForm.word}
                  onSubmit={handleCorrection}
                  onCancel={() => setCorrectionForm(null)}
                />
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TranscriptEditor;
