import React, { useEffect, useState, useRef } from "react";
import { generate } from "random-words";

const numberOfWordsInitial = 20;
const seconds = 10;

export const TypingSpeedApp = () => {
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState([]);
  const [countDown, setCountDown] = useState(seconds);
  const [numberOfWords, setNumberOfWords] = useState(numberOfWordsInitial);
  const [currentInput, setCurrentInput] = useState();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [status, setStatus] = useState("waiting");
  const [currCharIndex, setCurrCharIndex] = useState(-1);
  const [currChar, setCurrChar] = useState("");
  const textInput = useRef(null);

  useEffect(() => {
    generateWords();
  }, [numberOfWords]);

  useEffect(() => {
    if (status === "started") {
      setWords(generateWords());
      textInput.current.focus();
    }
  }, [status]);

  const generateWords = async () => {
    setLoading(true);
    const newWords = await Promise.all(
      Array.from({ length: numberOfWords }, async () => {
        return await generate();
      })
    );
    setWords(newWords);
    setLoading(false);
  };

  const start = () => {
    if (status === "finished") {
      setWords(generateWords());
      setCorrect(0);
      setIncorrect(0);
      setCurrentWordIndex(0);
      setCountDown(countDown);
      setCurrCharIndex(-1);
      setCurrChar("");
      setNumberOfWords(numberOfWords);
    }

    if (status !== "started") {
      setStatus("started");
      let interval = setInterval(() => {
        setCountDown((prev) => {
          if (prev === 0) {
            clearInterval(interval);
            setStatus("finished");
            setCurrentInput("");
            return seconds;
          } else {
            return prev - 1;
          }
        });
      }, 1000);
    }
  };

  const handleKeyDown = ({ keyCode, key }) => {
    if (keyCode === 32) {
      checkMatch();
      setCurrentInput("");
      setCurrentWordIndex(currentWordIndex + 1);
      setCurrCharIndex(-1);
    } else if (keyCode === 8) {
      setCurrCharIndex(currCharIndex - 1);
      setCurrChar("");
    } else {
      setCurrCharIndex(currCharIndex + 1);
      setCurrChar(key);
    }
  };
  const checkMatch = () => {
    const wordToCompare = words[currentWordIndex];
    const doesItMatch = wordToCompare === currentInput.trim();
    if (doesItMatch) {
      setCorrect(correct + 1);
    } else {
      setIncorrect(incorrect + 1);
    }
  };
  const handleDropDownTime = (e) => {
    setCountDown(e.target.value);
  };
  const handleDropDownLength = (e) => {
    setNumberOfWords(e.target.value);
    console.log(numberOfWords);
  };

  const getCharClass = (wordIdx, charIdx, char) => {
    if (
      wordIdx === currentWordIndex &&
      charIdx === currCharIndex &&
      char &&
      status !== "finished"
    ) {
      if (char === currChar) {
        return "has-background-success";
      } else {
        return "has-background-danger";
      }
    } else if (
      wordIdx === currentWordIndex &&
      currCharIndex >= words[currentWordIndex].length
    ) {
      return "has-background-danger";
    } else {
      return "";
    }
  };
  return (
    <div>
      {status === "started" && (
        <div className="section">
          <div className="is-size-1 has-text-centered has-text-success-light">
            <h1>{countDown}</h1>
          </div>
        </div>
      )}

      {(status === "finished" || status === "waiting") && (
        <div className="columns m-5">
          <div className="column has-text-centered">
            <div className="p is-size-2 has-text-success-light">
              Time:{countDown}
            </div>
            <div className="select is-dark is-size-3">
              <select onChange={handleDropDownTime}>
                <option value={10}>{seconds}</option>
                <option value={15}>{15}</option>
                <option value={30}>{30}</option>
              </select>
            </div>
          </div>

          <div className="column has-text-centered ">
            <div className="p is-size-2 has-text-light ">
              Length:{numberOfWords}
            </div>
            <div className="select is-dark is-size-3">
              <select onChange={handleDropDownLength}>
                <option value={20}>{20}</option>
                <option value={50}>{50}</option>
                <option value={5}>{5}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="control is-expanded section is-centered input-container">
        <input
          ref={textInput}
          disabled={status !== "started"}
          type="text"
          className="input mt-6 has-background-black has-text-light mx-auto input-start"
          value={currentInput}
          onKeyDown={handleKeyDown}
          onChange={(e) => setCurrentInput(e.target.value)}
        />
      </div>

      {status !== "started" && (
        <div className="section">
          <button
            className="button has-text-light is-fullwidth button-start mx-auto is-medium has-background-grey"
            onClick={start}
          >
            Start
          </button>
        </div>
      )}

      {status === "started" && (
        <div className="section">
          <div className="card">
            <div className="card-content has-background-grey has-text-light">
              <div className="content has-text-centered">
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <>
                    {words?.map((word, i) => (
                      <>
                        <span key={i}>
                          {word?.split("").map((char, idx) => (
                            <span
                              className={getCharClass(i, idx, char)}
                              key={idx}
                            >
                              {char}
                            </span>
                          ))}
                        </span>
                        <span> </span>
                      </>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {status === "finished" && (
        <div className="section">
          <div className="columns is-variable is-2">
            <div className="column has-text-centered is-half">
              <div className="columns">
                <div className="column"></div>
                <div className="column has-background-grey-dark has-text-light">
                  <div className="is-size-4">Words Per minute</div>
                  <p className="is-size-1">{correct}</p>
                </div>
                <div className="column"></div>
              </div>
            </div>

            <div className="column has-text-centered is-half  ">
              <div>
                <div className="columns">
                  <div className="column"></div>
                  <div className="column has-background-grey-dark has-text-light">
                    <div className="is-size-4">Accuracy:</div>
                    <p className="is-size-1">
                      {((correct / (correct + incorrect)) * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div className="column"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingSpeedApp;
