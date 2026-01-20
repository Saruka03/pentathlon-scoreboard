import { useState } from "react";
import { useTeams } from "../../context/TeamContext";
import { useNavigate } from "react-router-dom";

const TeamInputForm = () => {
  const [inputs, setInputs] = useState<string[]>(Array(5).fill(""));
  const { setTeams } = useTeams();
  const navigate = useNavigate();

  const handleChange = (index: number, value: string) => {
    const updated = [...inputs];
    updated[index] = value;
    setInputs(updated);
  };

  const handleSubmit = () => {
    if (inputs.some(name => name.trim() === "")) {
      alert("Please enter all 5 team names");
      return;
    }

    setTeams(inputs);
    navigate("/round1"); // next step later
  };

  return (
    <div>
      <h2>Enter Team Names</h2>

      {inputs.map((value, index) => (
        <input
          key={index}
          type="text"
          placeholder={`Team ${index + 1}`}
          value={value}
          onChange={(e) => handleChange(index, e.target.value)}
        />
      ))}

      <button onClick={handleSubmit}>Continue</button>
    </div>
  );
};

export default TeamInputForm;
