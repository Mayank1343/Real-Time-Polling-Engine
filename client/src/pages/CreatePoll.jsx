import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CreatePoll() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [pollLink, setPollLink] = useState("");

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/polls", {
        question,
        options,
      });

      const pollId = response.data.poll._id;

    const shareableLink =
    `${window.location.origin}/poll/${pollId}`;

    setPollLink(shareableLink);
    } catch (error) {
      console.error(error);
      alert("Failed to create poll");
    }
  };

  //Copy function
    const copyLink = async () => {
    try {
        await navigator.clipboard.writeText(pollLink);
        alert("Link copied successfully!");
    } catch (error) {
        console.error(error);
    }
    };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto" }}>
      <h1>Create Poll</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Enter poll question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <br />
        <br />

        {options.map((option, index) => (
          <div key={index}>
            <input
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) =>
                handleOptionChange(index, e.target.value)
              }
            />
          </div>
        ))}

        <br />

        <button type="button" onClick={addOption}>
          Add Option
        </button>

        <button type="submit">
          Create Poll
        </button>
      </form>

        {/* Show Link After Creation */}
            {pollLink && (
        <div
            style={{
            marginTop: "30px",
            padding: "15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            }}
        >
            <h3>Poll Created Successfully 🎉</h3>

            <p>Share this link with others:</p>

            <input
            value={pollLink}
            readOnly
            style={{
                width: "100%",
                padding: "10px",
            }}
            />

            <br />
            <br />

            <button onClick={copyLink}>
            Copy Link
            </button>

            <button
            style={{ marginLeft: "10px" }}
            onClick={() =>
                navigate(
                pollLink.replace(
                    window.location.origin,
                    ""
                )
                )
            }
            >
            Open Poll
            </button>
        </div>
        )}
    </div>
  );
}

export default CreatePoll;