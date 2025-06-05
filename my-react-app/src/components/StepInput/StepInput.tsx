import styles from "./StepInput.module.css";

interface StepInputProps {
  title: string;
  steps: string[];
  onChange: (newSteps: string[]) => void;
}

const StepInput: React.FC<StepInputProps> = ({ title, steps, onChange }) => {
  const handleChange = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...steps, ""]);
  };

  const handleDelete = (index: number) => {
    const updated = steps.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className={styles.stepSection}>
      <h3>{title}</h3>
      {steps.map((step, index) => (
        <div key={index} className={styles.stepItem}>
          <label>手順 {index + 1}</label>
          <textarea
            value={step}
            onChange={(e) => handleChange(index, e.target.value)}
            rows={2}
            className={styles.stepTextarea}
          />
          <button
            type="button"
            onClick={() => handleDelete(index)}
            className={styles.deleteStepButton}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className={styles.addStepButton}
      >
        ＋ 手順を追加
      </button>
    </div>
  );
};

export default StepInput;