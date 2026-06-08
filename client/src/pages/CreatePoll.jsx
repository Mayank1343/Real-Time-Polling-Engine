import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CreatePoll() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

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

      navigate(`/poll/${response.data.poll._id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to create poll");
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
    </div>
  );
}

export default CreatePoll;