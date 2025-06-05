import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import RecipeCard from "../../components/RecipeCard/RecipeCard";
import styles from "./RecipeListPage.module.css";

const RecipeListPage = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState("すべて");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "recipes"));
        const fetchedRecipes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecipes(fetchedRecipes);
      } catch (error) {
        console.error("レシピの取得に失敗しました", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter(
    (recipe) =>
      (selectedType === "すべて" || recipe.type === selectedType) &&
      recipe.title.toLowerCase().includes(searchKeyword.toLowerCase())
  );
  if (loading) return <p>読み込み中...</p>;

  return (
    <div className={styles.ReciprListPage}>
      <div className={styles.sort}>
        {["すべて", "主菜", "副菜", "汁物"].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={type === selectedType ? styles.active : ""}
          >
            {type}
          </button>
        ))}
      </div>
      <div>
        <input
          type="text"
          placeholder="レシピを検索"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {filteredRecipes.map((r) => (
        <RecipeCard key={r.id} id={r.id} title={r.title} />
      ))}
    </div>
  );
};

export default RecipeListPage;
