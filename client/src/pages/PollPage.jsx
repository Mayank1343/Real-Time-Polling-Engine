import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../services/api";

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

  if (loading) return <h2>Loading...</h2>;

  if (!poll) return <h2>Poll not found</h2>;

  const totalVotes = poll.options.reduce(
    (sum, option) => sum + option.votes,
    0
  );

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
      }}
    >
      <h1>{poll.question}</h1>

      <p>
        Status:
        <strong> {poll.status.toUpperCase()}</strong>
      </p>

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
            disabled={selectedOption === null}
            onClick={handleVote}
            >
            Vote
            </button>
        </>
        )}

        {poll.status === "open" && (
        <button
            onClick={handleClosePoll}
            style={{
            marginLeft: "10px",
            marginTop: "15px",
            }}
        >
            Close Poll
        </button>
        )}

      <hr />

      <h2>Live Results</h2>

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
            <div>
              {option.text} ({option.votes})
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
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PollPage;