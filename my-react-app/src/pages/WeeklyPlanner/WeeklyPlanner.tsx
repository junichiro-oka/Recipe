import { useEffect, useState } from "react";
import styles from "./WeeklyPlanner.module.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface Recipe {
  id: string;
  title: string;
  type: string;
}

const days = ["日", "月", "火", "水", "木", "金", "土"];
const times = ["昼", "夜"];
const recipeTypes = ["主菜", "副菜", "汁物"];

const WeeklyPlanner = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [plan, setPlan] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchRecipes = async () => {
      const snapshot = await getDocs(collection(db, "recipes"));
      const recipeList = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
        type: doc.data().type,
      }));
      setRecipes(recipeList);
    };

    fetchRecipes();
  }, []);

  const handleChange = (day: string, time: string, type: string, value: string) => {
    const key = `${day}-${time}-${type}`;
    const updatedPlan = { ...plan, [key]: value };
    setPlan(updatedPlan);
    savePlanToFirebase(updatedPlan); // ← 自動保存
  };

  const savePlanToFirebase = async (plan: Record<string, string>) => {
    try {
      await setDoc(doc(db, "weeklyPlans", "current"), plan);
      console.log("保存成功");
    } catch (error) {
      console.error("保存失敗", error);
    }
  };

  useEffect(() => {
    const fetchPlan = async () => {
      const docRef = doc(db, "weeklyPlans", "current");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPlan(docSnap.data() as Record<string, string>);
      }
    };
    fetchPlan();
  }, []);

  const handleClear = async () => {
    const confirmClear = window.confirm("削除しますか？");
    if (!confirmClear) return;
  
    const emptyPlan: Record<string, string> = {};
    setPlan(emptyPlan);
  
    try {
      await setDoc(doc(db, "weeklyPlans", "current"), emptyPlan);
      console.log("プランをクリアしました");
    } catch (error) {
      console.error("クリアに失敗しました", error);
    }
  };
  

  return (
    <div className={styles.plannerContainer}>
      <div className={styles.timeLabels}>
        <div>昼</div>
        <div>夜</div>
      </div>
      {days.map((day) => (
        <div key={day} className={styles.planCard}>
          <p className={styles.dayName}>{day}</p>
          {times.map((time) => (
            <div key={time} className={styles.timeBlock}>
              {recipeTypes.map((type) => {
                const key = `${day}-${time}-${type}`;
                return (
                  <div className={styles.planSelect} key={key}>
                    {time === "昼" && (
                      <p className={styles[type]}>{type}</p>
                    )}
                    <select
                      value={plan[key] || ""}
                      onChange={(e) => handleChange(day, time, type, e.target.value)}
                    >
                      <option value=""></option>
                      {recipes
                        .filter((recipe) => recipe.type === type)
                        .map((recipe) => (
                          <option key={recipe.id} value={recipe.title}>
                            {recipe.title}
                          </option>
                        ))}
                    </select>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}
      <div className={styles.buttonArea}>
        <button onClick={handleClear}>選択をクリア</button>
      </div>
    </div>
  );
};

export default WeeklyPlanner;
