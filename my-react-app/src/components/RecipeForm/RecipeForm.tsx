import { useState, useRef, useEffect, useCallback } from "react";
import MaterialSelectInput from "../MaterialSelectInput/MaterialSelectInput";
import styles from "./RecipeForm.module.css";
import FoodForm from "../FoodForm/FoodForm";
import StepInput from "../StepInput/StepInput";
import { db } from "../../firebase/firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";

// 型定義
type SelectedIngredient = {
  value: string;
  label: string;
  unit: string;
  quantity: number;
  mark: string;
};

interface RecipeFormProps {
  existingRecipe?: any;
  recipeId?: string;
  onCancel?: () => void;
  onSave?: () => void;
}

const RecipeForm = ({ existingRecipe, recipeId, onCancel, onSave }: RecipeFormProps) => {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<SelectedIngredient[]>([]);
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [type, setType] = useState("主菜");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const inputRef = useRef<{ refreshIngredients: () => void }>(null);

  const handleFoodFormClose = () => {
    if (inputRef.current) inputRef.current.refreshIngredients();
  };

  // onIngredientsChangeをuseCallbackでメモ化
  const handleIngredientsChange = useCallback((newIngredients: SelectedIngredient[]) => {
    console.log("=== RecipeForm - ingredients updated ===");
    console.log("New ingredients:", newIngredients);
    setIngredients(newIngredients);
  }, []);

  // 初期化処理を改善
  useEffect(() => {
    console.log("RecipeForm - existingRecipe changed:", existingRecipe);
    if (existingRecipe) {
      setTitle(existingRecipe.title || "");
      setType(existingRecipe.type || "主菜");
      setNotes(existingRecipe.notes || "");
      setSteps(existingRecipe.steps || []);
      
      // 材料の初期化（空配列チェックを追加）
      const initialIngredients = Array.isArray(existingRecipe.ingredients) 
        ? existingRecipe.ingredients 
        : [];
      console.log("Setting ingredients:", initialIngredients);
      setIngredients(initialIngredients);
    } else {
      // 新規作成時は初期値をセット
      setTitle("");
      setType("主菜");
      setNotes("");
      setIngredients([]);
      setSteps([]);
    }
  }, [existingRecipe]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("料理名を入力してください");
      return;
    }

    setLoading(true);
    setSuccessMessage("");

    try {
      const recipeData = {
        title: title.trim(),
        type,
        notes: notes.trim(),
        ingredients,
        steps: steps.filter(step => step.trim() !== ""),
      };

      console.log("=== 保存データの詳細 ===");
      console.log("Title:", recipeData.title);
      console.log("Type:", recipeData.type);
      console.log("Notes:", recipeData.notes);
      console.log("Steps:", recipeData.steps);
      console.log("Ingredients (count):", recipeData.ingredients.length);
      console.log("Ingredients (detail):", recipeData.ingredients);
      console.log("RecipeId:", recipeId);

      if (recipeId) {
        const docRef = doc(db, "recipes", recipeId);
        await updateDoc(docRef, recipeData);
        setSuccessMessage("レシピを更新しました！");
        console.log("更新完了 - RecipeId:", recipeId);
      } else {
        const docRef = await addDoc(collection(db, "recipes"), recipeData);
        setSuccessMessage("レシピを登録しました！");
        console.log("新規登録完了 - New RecipeId:", docRef.id);
      }

      if (onSave) {
        onSave();
      }

      // 新規作成時のみフォームをリセット
      if (!recipeId) {
        setTitle("");
        setType("主菜");
        setNotes("");
        setSteps([]);
        setIngredients([]);
      }
    } catch (error) {
      console.error("保存エラーの詳細:", error);
      alert("保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.recipeForm}>
      <h2>{recipeId ? "レシピ編集" : "レシピ登録"}</h2>

      <div className={styles.recipeTitle}>
        <h3>料理名</h3>
        <input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          placeholder="料理名を入力してください"
        />
      </div>

      <div className={styles.selectType}>
        <h3>料理の種類</h3>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="主菜">主菜</option>
          <option value="副菜">副菜</option>
          <option value="汁物">汁物</option>
        </select>
      </div>

      <div className={styles.MaterialSelectInput}>
        <MaterialSelectInput
          key={existingRecipe ? `edit-${recipeId}-${existingRecipe.title}` : 'new'}
          title="材料"
          ref={inputRef}
          onChange={handleIngredientsChange}
          initialIngredients={ingredients}
        />
        <button className={styles.addButton} onClick={() => setShowFoodForm(true)}>
          ＋ 食材を登録
        </button>
      </div>

      <div className={styles.StepInput}>
        <StepInput title="調理手順" steps={steps} onChange={setSteps} />
      </div>

      <div className={styles.notes}>
        <h3>自由記述欄</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className={styles.memoTextarea}
          placeholder="備考やメモを入力してください"
        />
      </div>

      <div className={styles.buttonGroup}>
        <button className={styles.submitButton} onClick={handleSubmit} disabled={loading}>
          {loading ? "保存中..." : recipeId ? "レシピを更新する" : "レシピを登録する"}
        </button>

        {onCancel && (
          <button onClick={onCancel} className={styles.cancelButton}>
            キャンセル
          </button>
        )}
      </div>

      {successMessage && <p className={styles.success}>{successMessage}</p>}

      {showFoodForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={() => setShowFoodForm(false)}>
              ×
            </button>
            <FoodForm onRegister={handleFoodFormClose} />
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeForm;