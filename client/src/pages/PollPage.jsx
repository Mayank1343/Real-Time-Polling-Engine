import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../services/api";
import Loader from "../components/Loader";
import Header from "../components/Header";

const socket = io("http://localhost:5000");

function PollPage() {
  const { id } = useParams();

  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoll();

    socket.emit("join-poll", id);

    socket.on("poll-updated", (updatedPoll) => {
      setPoll(updatedPoll);
    });

    return () => {
      socket.off("poll-updated");
    };
  }, [id]);

  const fetchPoll = async () => {
    try {
      const res = await api.get(`/polls/${id}`);
      setPoll(res.data.poll);
    } catch (error) {
      console.error(error);
      alert("Failed to load poll");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    try {
      await api.post(`/polls/${id}/vote`, {
        optionIndex: selectedOption,
      });

      setHasVoted(true);
    } catch (error) {
      alert(
        error?.response?.data?.message || "Voting failed"
      );
    }
  };

  const handleClosePoll = async () => {
    try {
      await api.patch(`/polls/${id}/close`);
    } catch (error) {
      alert("Failed to close poll");
    }
  };

  if (loading) return <Loader />;

  if (!poll) return <h2>Poll not found</h2>;

  const totalVotes = poll.options.reduce(
    (sum, option) => sum + option.votes,
    0
  );

  const winner = [...poll.options].sort(
    (a, b) => b.votes - a.votes
    )[0];

  return (
  <div className="container">
  <Header />
    {poll.expiresAt && (
    <p
        style={{
        marginTop: "10px",
        color: "#6b7280",
        }}
    >
        ⏳ Expires:
        {" "}
        {new Date(
        poll.expiresAt
        ).toLocaleString()}
    </p>
    )}
    <div className="container">
    <div className="card">
      <h1>{poll.question}</h1>

      <div
        style={{
            display: "inline-block",
            padding: "8px 12px",
            borderRadius: "20px",
            background:
            poll.status === "open"
                ? "#d4edda"
                : "#f8d7da",
            marginBottom: "20px",
        }}
        >
        {poll.status === "open"
            ? "🟢 Open"
            : "🔴 Closed"}
        </div>

      {poll.status === "open" && !hasVoted && (
        <>
            {poll.options.map((option, index) => (
            <div key={index}>
                <label>
                <input
                    type="radio"
                    name="vote"
                    onChange={() => setSelectedOption(index)}
                />
                {option.text}
                </label>
            </div>
            ))}

            <br />

            <button
            className="success-btn"
            disabled={selectedOption === null}
            onClick={handleVote}
            >
            Vote
            </button>
        </>
        )}

        {poll.status === "open" && (
        <button
        className="danger-btn"
        onClick={handleClosePoll}
        >
            Close Poll
        </button>
        )}
            <p>
            Created:
            {" "}
            {new Date(
                poll.createdAt
            ).toLocaleString()}
            </p>

      <hr />

      <div
        style={{
            padding: "15px",
            marginBottom: "20px",
            background: "#e8f5e9",
            borderRadius: "8px",
        }}
        >
        🏆 Leading Option:
        <strong> {winner.text}</strong>
        </div>

      <h2>Live Results</h2>

      <div
        style={{
            padding: "15px",
            marginBottom: "20px",
            background: "#f5f5f5",
            borderRadius: "8px",
        }}
        >
        <strong>Total Votes:</strong> {totalVotes}
        </div>

      {poll.options.map((option, index) => {
        const percentage =
          totalVotes === 0
            ? 0
            : (option.votes / totalVotes) * 100;

        return (
          <div
            key={index}
            style={{ marginBottom: "15px" }}
          >
            <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "5px",
            }}
            >
            <span>{option.text}</span>

            <span>
                {option.votes} vote{option.votes !== 1 ? "s" : ""}
                {" "}
                ({percentage.toFixed(1)}%)
            </span>
            </div>

            <div
              style={{
                background: "#ddd",
                height: "20px",
                borderRadius: "5px",
              }}
            >
              <div
                style={{
                    width: `${percentage}%`,
                    height: "100%",
                    background: "#4caf50",
                    borderRadius: "5px",
                    transition: "width 0.4s ease",
                }}
                />
            </div>
          </div>
        );
      })}
    </div>
    </div>
</div>

  );
}

export default PollPage;