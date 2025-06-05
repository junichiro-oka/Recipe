import { useEffect, useState, forwardRef, useImperativeHandle, useCallback } from "react";
import Select from "react-select";
import styles from "./MaterialSelectInput.module.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";

interface Props {
    title: string;
    onChange: (ingredients: SelectedIngredient[]) => void;
    initialIngredients?: SelectedIngredient[];
}

interface IngredientOption {
  value: string;
  label: string;
  unit: string;
}

type SelectedIngredient = IngredientOption & {
  quantity: number;
  mark: string;
};

const MaterialSelectInput = forwardRef(({ title, onChange, initialIngredients = [] }: Props, ref) => {
  const [ingredientOptions, setIngredientOptions] = useState<IngredientOption[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);

  const fetchIngredients = async () => {
    const snapshot = await getDocs(collection(db, "ingredients"));
    const ingredients: IngredientOption[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        value: doc.id,
        label: data.name,
        unit: data.unit,
      };
    });
    setIngredientOptions(ingredients);
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    console.log("Initial ingredients changed:", initialIngredients);
    setSelectedIngredients(initialIngredients || []);
  }, [initialIngredients]);

  const notifyChange = useCallback((ingredients: SelectedIngredient[]) => {
    console.log("=== MaterialSelectInput - onChange通知 ===");
    console.log("Current selectedIngredients:", ingredients);
    console.log("selectedIngredients length:", ingredients.length);
    onChange(ingredients);
  }, [onChange]);

  const updateSelectedIngredients = useCallback((updater: (prev: SelectedIngredient[]) => SelectedIngredient[]) => {
    setSelectedIngredients((prev) => {
      const newIngredients = updater(prev);
      setTimeout(() => notifyChange(newIngredients), 0);
      return newIngredients;
    });
  }, [notifyChange]);

  useImperativeHandle(ref, () => ({
    refreshIngredients: fetchIngredients,
  }));

  const handleChange = (selected: IngredientOption | null) => {
    if (selected) {
      const newIngredient: SelectedIngredient = {
        ...selected,
        quantity: 1,
        mark: "",
      };
      updateSelectedIngredients((prev) => [...prev, newIngredient]);
    }
  };

  const handleMarkChange = (index: number, newMark: string) => {
    updateSelectedIngredients((prev) =>
      prev.map((ing, i) =>
        i === index ? { ...ing, mark: newMark } : ing
      )
    );
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    updateSelectedIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, quantity: newQuantity } : ing))
    );
  };

  const handleDeleteIngredient = (indexToDelete: number) => {
    updateSelectedIngredients((prev) => prev.filter((_, i) => i !== indexToDelete));
  };

  return (
    <div className={styles.MaterialSelectInput}>
      <h3>{title}</h3>
      <Select
        options={ingredientOptions}
        onChange={handleChange}
        placeholder="食材を検索・選択"
        isClearable
        value={null}
      />

      <ul className={styles.ingUl}>
        {selectedIngredients.map((ing, index) => (
          <li key={`${ing.value}-${index}`} className={styles.ingList}>
            <div className={styles.ingSelect}>  
                <select
                    value={ing.mark || ""}
                    onChange={(e) => handleMarkChange(index, e.target.value)}
                    className={styles.markInput}
                >
                    <option value=""></option>
                    <option value="☆">☆</option>
                    <option value="◎">◎</option>
                    <option value="♡">♡</option>
                </select>
                <div>
                    <span>・</span>
                    {ing.label}
                </div>
            </div>  
            <div className={styles.quantity}>
              <select
                value={ing.quantity}
                onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
              >
                {[
                    // 1〜20（0.5刻み）
                    ...Array.from({ length: 40 }, (_, i) => {
                        const value = (i + 1) * 0.5;
                        return (
                        <option key={value} value={value}>
                            {value}
                        </option>
                        );
                    }),

                    // 30〜1000（10刻み）
                    ...Array.from({ length: 98 }, (_, i) => {
                        const value = 30 + i * 10;
                        return (
                        <option key={value} value={value}>
                            {value}
                        </option>
                        );
                    }),
                    ]}
              </select>
              <div className={styles.unit}>{ing.unit}</div>
              <button
                onClick={() => handleDeleteIngredient(index)}
                className={styles.deleteButton}
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default MaterialSelectInput;