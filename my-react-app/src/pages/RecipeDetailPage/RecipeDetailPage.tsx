import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import styles from "./RecipeDetailPage.module.css";
import RecipeForm from "../../components/RecipeForm/RecipeForm";

// Recipe型を定義
interface Ingredient {
  label: string;
  quantity: string;
  unit: string;
}

interface Recipe {
  id: string;
  title: string;
  ingredients: Ingredient[];
  steps: string[];
  notes?: string;
}

const RecipeDetailPage = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  const fetchRecipe = async () => {
    if (!id) return;

    try {
      const docRef = doc(db, "recipes", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const fetchedData: Recipe = { 
          id: docSnap.id, 
          title: data.title,
          ingredients: data.ingredients || [],
          steps: data.steps || [],
          notes: data.notes
        };
        
        setRecipe(fetchedData);
      } else {
        console.log("レシピが見つかりません - ID:", id);
        setRecipe(null);
      }
    } catch (error) {
      console.error("レシピの取得に失敗しました", error);
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRecipe();
    }
  }, [id]);
  
  if (loading) {
    return <p>読み込み中...</p>;
  }

  if (!recipe) {
    return <p>レシピが見つかりませんでした。</p>;
  }

  const handleDelete = async () => {
    if (!id) return;
  
    const confirmDelete = window.confirm("本当にこのレシピを削除しますか？");
    if (!confirmDelete) return;
  
    try {
      await deleteDoc(doc(db, "recipes", id));
      alert("レシピを削除しました");
      navigate("/recipes");
    } catch (error) {
      console.error("削除エラー:", error);
      alert("削除に失敗しました");
    }
  };

  const handleEditSave = async () => {
    setIsEditing(false);
    await fetchRecipe();
  };

  return (
    <div className={styles.RecipeDetailPage}>
      <div>
        {isEditing ? (
          <RecipeForm
            key={`edit-${recipe.id}`}
            existingRecipe={recipe}
            recipeId={recipe.id}
            onCancel={() => setIsEditing(false)}
            onSave={handleEditSave}
          />
        ) : (
          <div>
            <h2>{recipe.title}</h2>
            <div className={styles.padding}>
              <h3>材料</h3>
              <ul className={styles.ing}>
                {recipe.ingredients && recipe.ingredients.map((ing, index) => (
                  <li key={index} className={styles.ingList}>
                    <div>{ing.label}</div>
                    <div>{ing.quantity}{ing.unit}</div>
                  </li>
                ))}
              </ul>
              <h3>作り方</h3>
              <ol className={styles.step}>
                {recipe.steps && recipe.steps.map((step, index) => (
                  <li key={index} className={styles.stepList}>{step}</li>
                ))}
              </ol>
              {recipe.notes && (
                <>
                  <h3>備考</h3>
                  <p>{recipe.notes}</p>
                </>
              )}
            </div>
            <div className={styles.Button}>
              <div className={styles.editButton}>
                <button onClick={() => setIsEditing(true)}>編集</button>
              </div>
              <div className={styles.deleteButton}>
                <button onClick={handleDelete}>削除する</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeDetailPage;