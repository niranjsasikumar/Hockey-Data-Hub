import { Link } from "react-router-dom";
import "./LinkCard.css"

function LinkCard({ text, image, link }) {
  return(
    <Link to={link} className="home-card">
      <div style={{ backgroundImage: `url(${image})` }}>
        <h1>{text}</h1>
      </div>
    </Link>
  );
}

export default LinkCard;