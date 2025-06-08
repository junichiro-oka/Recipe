import React from "react";
import styles from "./Footer.module.css";
import { Link } from "react-router-dom";


const Footer = () => {
    return (
      <footer className={styles.footer}>
        <nav className={styles.nav}>
          <Link to="/">レシピ一覧</Link>
          <Link to="/foodForm">食材登録</Link>
          <Link to="/weeklyPlanner">献立</Link>
          <Link to="/shoppingList">買い物リスト</Link>
        </nav>
      </footer>
    );
  };
  
  export default Footer;