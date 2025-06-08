import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RecipeListPage from './pages/RecipeListPage/RecipeListPage';
import RecipeDetailPage from "./pages/RecipeDetailPage/RecipeDetailPage";
import RecipeForm from './components/RecipeForm/RecipeForm';
import FoodForm from './components/FoodForm/FoodForm';
import WeeklyPlanner from './pages/WeeklyPlanner/WeeklyPlanner';
import ShoppingListPage from './pages/ShoppingListPage/ShoppingListPage';
import Footer from './components/Footer/Footer';



const App = () =>  {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RecipeListPage />} />
        <Route path="recipe/:id" element={<RecipeDetailPage />} />
        <Route path="recipeForm" element={<RecipeForm />} />
        <Route path="foodForm" element={<FoodForm />} />
        <Route path="weeklyPlanner" element={<WeeklyPlanner />} />
        <Route path="shoppingList" element={<ShoppingListPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App
