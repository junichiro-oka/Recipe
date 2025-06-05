import styles from "./RecipeCard.module.css"
import { Link } from "react-router-dom";

interface Props {
    id: string;
    title: string;
}

const RecipeCard = ({id, title}: Props) => {
    
    return(
        <div className={styles.RecipeCard}>
            <Link to={`/recipe/${id}`} className={styles.recipeCardLink}>
                {title}
            </Link>
        </div>
    );
};

export default RecipeCard;