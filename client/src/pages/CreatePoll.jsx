import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Loader from "../components/Loader";
import Header from "../components/Header";

function CreatePoll() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [pollLink, setPollLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentPolls, setRecentPolls] = useState([]);
  const [loadingPolls, setLoadingPolls] = useState(true);
  const [duration, setDuration] = useState(60);

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
        } finally {
            setLoadingPolls(false);
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
        duration,
        });

      const pollId = response.data.poll._id;

    const shareableLink =
    `${window.location.origin}/poll/${pollId}`;

    setPollLink(shareableLink);
    } catch (error) {
      console.error(error);
      alert("Failed to create poll");
    } finally {
      setIsSubmitting(false);
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

    const deletePoll = async (pollId) => {
  const confirmed = window.confirm(
    "Delete this poll permanently?"
  );

  if (!confirmed) return;

  try {
    await api.delete(`/polls/${pollId}`);

    setRecentPolls((prev) =>
      prev.filter(
        (poll) => poll._id !== pollId
      )
    );
  } catch (error) {
    console.error(error);
    alert("Failed to delete poll");
  }
};



  return (
  <div className="container">
    <Header />

    <div className="card">
      {/* Recent Polls Section */}
      <h2 style={{ marginBottom: "20px" }}>
        Recent Polls
      </h2>

      {loadingPolls ? (
        <Loader />
      ) : recentPolls.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            padding: "30px",
            color: "#6b7280",
          }}
        >
          No polls available yet.
          <br />
          Create your first poll below.
        </p>
      ) : (
        recentPolls.map((poll) => (
          <div
            key={poll._id}
            className="poll-card"
          >
            <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}
            >
              <div>
                <h4 style={{ marginBottom: "6px" }}>
                  {poll.question}
                </h4>

                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    background:
                      poll.status === "open"
                        ? "#d4edda"
                        : "#f8d7da",
                  }}
                >
                  {poll.status === "open"
                    ? "🟢 Open"
                    : "🔴 Closed"}
                </span>
              </div>

              <div
  style={{
    display: "flex",
    gap: "10px",
  }}
>
        <button
            className="primary-btn"
            onClick={() =>
            navigate(`/poll/${poll._id}`)
            }
        >
            Open
        </button>

        {poll.status === "closed" && (
            <button
            className="danger-btn"
            onClick={() =>
                deletePoll(poll._id)
            }
            >
            Delete
            </button>
  )}
</div>
            </div>
          </div>
        ))
      )}

      <hr
        style={{
          margin: "30px 0",
        }}
      />

      {/* Create Poll Section */}
      <h2
        style={{
          marginBottom: "20px",
        }}
      >
        Create New Poll
      </h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Enter poll question"
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
        />

        {options.map((option, index) => (
          <div key={index}>
            <input
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) =>
                handleOptionChange(
                  index,
                  e.target.value
                )
              }
            />
          </div>
        ))}

        {/* Auto Expiry */}
        <div style={{ marginTop: "10px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
            }}
          >
            Auto Close After
          </label>

          <select
            value={duration}
            onChange={(e) =>
              setDuration(Number(e.target.value))
            }
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
            }}
          >
            <option value={5}>
              5 Minutes
            </option>

            <option value={30}>
              30 Minutes
            </option>

            <option value={60}>
              1 Hour
            </option>

            <option value={1440}>
              1 Day
            </option>
          </select>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "15px",
          }}
        >
          <button
            type="button"
            onClick={addOption}
          >
            Add Option
          </button>

          <button
            type="submit"
            className="primary-btn"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Creating..."
              : "Create Poll"}
          </button>
        </div>
      </form>

      {/* Share Link Section */}
      {pollLink && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            background: "#f8fafc",
            borderRadius: "12px",
            border: "1px solid #d1d5db",
          }}
        >
          <h3
            style={{
              marginBottom: "10px",
            }}
          >
            🎉 Poll Created Successfully
          </h3>

          <p
            style={{
              marginBottom: "10px",
            }}
          >
            Share this link with others:
          </p>

          <input
            value={pollLink}
            readOnly
          />

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            <button
              className="success-btn"
              onClick={copyLink}
            >
              Copy Link
            </button>

            <button
              className="primary-btn"
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
        </div>
      )}
    </div>
  </div>
);
}

export default CreatePoll;