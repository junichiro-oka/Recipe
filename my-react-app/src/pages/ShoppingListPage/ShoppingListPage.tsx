import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import styles from "./ShoppingListPage.module.css";

interface Ingredient {
  label: string;
  quantity: number;
  unit: string;
}

const ShoppingListPage = () => {
  const [shoppingList, setShoppingList] = useState<Record<string, { quantity: number; unit: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShoppingList = async () => {
      setLoading(true);
      try {
        // 1. 献立を取得
        const planSnap = await getDoc(doc(db, "weeklyPlans", "current"));
        if (!planSnap.exists()) return;
        const plan = planSnap.data() as Record<string, string>;

        // 2. 献立に使われているレシピタイトルを抽出
        const usedTitles = Object.values(plan).filter((v) => v);

        // 3. レシピデータを取得
        const recipeSnap = await getDocs(collection(db, "recipes"));
        const recipeDocs = recipeSnap.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          ingredients: doc.data().ingredients as Ingredient[],
        }));

        // 4. 買い物リストに含める材料を集計
        const ingredientMap: Record<string, { quantity: number; unit: string }> = {};

        for (const recipe of recipeDocs) {
          if (usedTitles.includes(recipe.title)) {
            for (const ing of recipe.ingredients) {
              // 非表示に設定された材料はスキップ
              const ingSnap = await getDocs(collection(db, "ingredients"));
              const excludeIds = ingSnap.docs
                .filter((doc) => doc.data().excludeFromList)
                .map((doc) => doc.data().name);
              if (excludeIds.includes(ing.label)) continue;

              if (ingredientMap[ing.label]) {
                ingredientMap[ing.label].quantity += ing.quantity;
              } else {
                ingredientMap[ing.label] = {
                  quantity: ing.quantity,
                  unit: ing.unit,
                };
              }
            }
          }
        }

        setShoppingList(ingredientMap);
      } catch (error) {
        console.error("買い物リストの取得に失敗", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShoppingList();
  }, []);

  if (loading) return <p>読み込み中...</p>;

  return (
    <div className={styles.shoppingListPage}>
      <h2>買い物リスト</h2>
      <ul className={styles.list}>
        {Object.entries(shoppingList).map(([label, data]) => (
          <li key={label} className={styles.item}>
            <span>{label}</span>
            <span>
              {data.quantity} {data.unit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShoppingListPage;
