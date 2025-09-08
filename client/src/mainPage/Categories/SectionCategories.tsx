import "./SectionCategories.css";
import { categories } from "clientSideInfo";
import { useNavigate } from "react-router-dom";

function Categories() {
  const navigate = useNavigate();
  return (
    <div className="Category-choice-Section">
      <h1>Search category</h1>
      <ul>
        {categories.map(({ id, svgId, href, name }) => (
          <li
            key={svgId}
            id={id}
            onClick={() => {
              navigate(`/search-ads?category=${name}`);
            }}
          >
            <svg id={svgId} width="24" height="24">
              <use xlinkHref={href}></use>
            </svg>
            <p>{name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Categories;
