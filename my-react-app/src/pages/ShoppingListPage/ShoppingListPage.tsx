import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import styles from "./ShoppingListPage.module.css";

interface Ingredient {
  label: string;
  quantity: number;
  unit: string;
}

const ShoppingListPage = () => {
  const [shoppingList, setShoppingList] = useState<Record<string, { quantity: number; unit: string }>>({});
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(true);

  // デバウンス用タイマー
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchShoppingList = async () => {
      setLoading(true);
      try {
        const planDocRef = doc(db, "weeklyPlans", "current");
        const planSnap = await getDoc(planDocRef);
        if (!planSnap.exists()) return;

        const plan = planSnap.data() as Record<string, any>;
        if (plan.memo) setMemo(plan.memo);

        const usedTitles = Object.values(plan).filter((v) => typeof v === "string" && v);

        const recipeSnap = await getDocs(collection(db, "recipes"));
        const recipeDocs = recipeSnap.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          ingredients: doc.data().ingredients as Ingredient[],
        }));

        const ingSnap = await getDocs(collection(db, "ingredients"));
        const excludeNames = ingSnap.docs
          .filter((doc) => doc.data().excludeFromList)
          .map((doc) => doc.data().name);

        const ingredientMap: Record<string, { quantity: number; unit: string }> = {};

        // 修正: 同じレシピが複数回選択された場合の対応
        for (const title of usedTitles) {
          if (!title) continue; // 空文字列をスキップ
          
          const recipe = recipeDocs.find(r => r.title === title);
          if (!recipe) continue;
          
          for (const ing of recipe.ingredients) {
            if (excludeNames.includes(ing.label)) continue;

            if (ingredientMap[ing.label]) {
              // 単位が同じかチェック
              if (ingredientMap[ing.label].unit === ing.unit) {
                ingredientMap[ing.label].quantity += ing.quantity;
              } else {
                // 単位が異なる場合は別項目として扱う
                const key = `${ing.label} (${ing.unit})`;
                if (ingredientMap[key]) {
                  ingredientMap[key].quantity += ing.quantity;
                } else {
                  ingredientMap[key] = {
                    quantity: ing.quantity,
                    unit: ing.unit,
                  };
                }
              }
            } else {
              ingredientMap[ing.label] = {
                quantity: ing.quantity,
                unit: ing.unit,
              };
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

  // メモ変更時にデバウンスして自動保存（修正: クリーンアップ追加）
  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);

    const newTimer = setTimeout(async () => {
      try {
        await updateDoc(doc(db, "weeklyPlans", "current"), { memo });
      } catch (error) {
        console.error("メモの自動保存に失敗しました", error);
      }
    }, 300);

    setDebounceTimer(newTimer);

    // コンポーネントのアンマウント時にタイマーをクリア
    return () => {
      if (newTimer) {
        clearTimeout(newTimer);
      }
    };
  }, [memo]);

  const handleClearMemo = () => {
    setMemo("");
  };

  if (loading) return <p>読み込み中...</p>;

  return (
    <div className={styles.shoppingListPage}>
      <h2>買い物リスト</h2>
      <ul className={styles.list}>
        {Object.entries(shoppingList).map(([label, data]) => (
          <li key={label} className={styles.item}>
            <span>・{label}</span>
            <span>
              {data.quantity} {data.unit}
            </span>
          </li>
        ))}
      </ul>

      <textarea
        rows={4}
        className={styles.memoTextarea}
        placeholder="メモ"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />
      <div className={styles.memoButtons}>
        <button onClick={handleClearMemo}>クリア</button>
      </div>
    </div>
  );
};

export default ShoppingListPage;