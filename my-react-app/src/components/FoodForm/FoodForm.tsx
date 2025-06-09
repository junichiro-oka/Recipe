import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase"
import { useEffect, useState } from "react";
import styles from "./FoodForm.module.css"


interface Ingredient {
    id: string;
    name: string;
    unit: string;
    excludeFromList?: boolean;
}

interface Props {
    onRegister?: () => void;
  }

const FoodForm = ({ onRegister }: Props) => {
    const [name, setName] = useState("");
    const [unit, setUnit] = useState("個");
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [excludeFromList, setExcludeFromList] = useState(false);


    const handleSubmit = async() => {
        if (!name || !unit) {
            alert("すべて入力してください")
            return;
        }

        try {
            //まず Firestore にある材料をすべて取得
            const snapshot = await getDocs(collection(db, "ingredients"));
            const existing = snapshot.docs.find(
                (doc) => (doc.data().name as string).trim() === name.trim()
            );

            // 同じ名前があれば登録中止
            if (existing) {
                alert("同じ名前の食材がすでに登録されています。");
                return;
            }

            // 重複していなければ登録
            await addDoc(collection(db, "ingredients"), {
                name: name.trim(),
                unit,
                excludeFromList,
            });
            setName("");
            setUnit("個");
            setExcludeFromList(false);
            await fetchIngredients();
            if (onRegister) onRegister();
        
        } catch (error) {
            console.error("Firestore登録エラー:", error);
            alert("登録に失敗しました")
        }
    }

    const handleDelete = async( id: string) => {
        try {
            await deleteDoc(doc(db, "ingredients", id));
            fetchIngredients();
        } catch (error) {
            console.error("削除に失敗しました", error);
            alert("削除できませんでした");
        }
    }

    const fetchIngredients = async () => {
        const snapshot = await getDocs(collection(db, "ingredients"));
        const ingredientList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Ingredient, "id">),
        }));
        setIngredients(ingredientList);
    };

    useEffect(() => {
        fetchIngredients();
    }, []);

    return (
        <div className={styles.foodForm}>
            <h2>食材を登録する</h2>
            <div>
                <h3>食材名</h3>
                <input className={styles.foodName} value={name} onChange={(e) => setName(e.target.value)} />
                <br />
                <h3>単位</h3>
                <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                    <option value="個">個</option>
                    <option value="g">g</option>
                    <option value="本">本</option>
                    <option value="玉">玉</option>
                    <option value="袋">袋</option>
                    <option value="パック">パック</option>
                    <option value="杯">杯</option>
                    <option value="ml">ml</option>
                    <option value="枚">枚</option>
                    <option value="缶">缶</option>
                    <option value="束">束</option>
                    <option value="カップ">カップ</option>
                    <option value="大さじ">大さじ</option>
                    <option value="小さじ">小さじ</option>
                    <option value="片">片</option>
                    <option value="房">房</option>
                    <option value="適量">適量</option>
                    <option value="少々">少々</option>
                </select>

                <div className={styles.check}>
                    <input
                        type="checkbox"
                        checked={excludeFromList}
                        onChange={(e) => setExcludeFromList(e.target.checked)}
                    />
                    <span>この食材を買い物リストに表示しない</span>
                </div>
            </div>
            <div><button className={styles.button} onClick={handleSubmit}>登録</button></div>

            <div>
                <h3>現在登録されている食材一覧</h3>
                <ul className={styles.list}>
                    {ingredients.map((ingredient) => (
                        <li key={ingredient.id} className={styles.ingList}>
                            <div>
                                <span>・</span>{ingredient.name}（{ingredient.unit}）
                            </div>
                            <button
                                onClick={() => handleDelete(ingredient.id)}
                                className={styles.deleteButton}>
                                     ×
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

    )
}

export default FoodForm;