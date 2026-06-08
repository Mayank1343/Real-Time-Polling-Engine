import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CreatePoll() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [pollLink, setPollLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentPolls, setRecentPolls] = useState([]);

  //Fetch Polls
  useEffect(() => {
    fetchRecentPolls();
    }, []);

    const fetchRecentPolls = async () => {
    try {
        const res = await api.get("/polls");
        setRecentPolls(res.data.polls);
    } catch (error) {
        console.error(error);
    }
    };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const handleSubmit = async (e) => {
    // Basic validation before hitting the API
    if (!question.trim()) {
    alert("Please enter a poll question");
    return;
    }

    const validOptions = options.filter(
    (option) => option.trim() !== ""
    );

    if (validOptions.length < 2) {
    alert("Please provide at least 2 valid options");
    return;
    }
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post("/polls", {
        question,
        options: validOptions,
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

        {/* Show Recent Polls */}
        <h2>Recent Polls</h2>

        {recentPolls.length === 0 ? (
        <p>No polls created yet.</p>
        ) : (
        recentPolls.map((poll) => (
            <div
            key={poll._id}
            style={{
                border: "1px solid #ddd",
                padding: "12px",
                marginBottom: "10px",
                borderRadius: "8px",
            }}
            >
            <h4>{poll.question}</h4>

            <p>
                {poll.status === "open"
                ? "🟢 Open"
                : "🔴 Closed"}
            </p>

            <button
                onClick={() =>
                navigate(`/poll/${poll._id}`)
                }
            >
                Open Poll
            </button>
            </div>
        ))
        )}

        <hr />

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

        <button
        type="submit"
        disabled={isSubmitting}
        >
        {isSubmitting ? "Creating..." : "Create Poll"}
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