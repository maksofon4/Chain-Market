import { useLocation, useNavigate } from "react-router-dom";
import "./pageTab.css";
import React from "react";

interface PageTabProps {
  content: React.ReactNode;
}

export const PageTab: React.FC<PageTabProps> = ({ content }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Mapping routes to heading text
  const headings: Record<string, React.ReactNode> = {
    "/posted-products": (
      <>
        <span className="hide">Your</span> <span>Posted</span>
        <span className="hide">Products</span>
      </>
    ),
    "/messages": (
      <>
        <span className="hide">Your</span> <span>Messages</span>
      </>
    ),
    "/selected-products": (
      <>
        <span>Selected</span> <span className="hide">Products</span>
      </>
    ),
    "/profile-options": (
      <>
        <span>Profile</span> <span className="hide">Options</span>
      </>
    ),
  };

  const currentPath = location.pathname;

  const activePath = Object.keys(headings).find((path) =>
    currentPath.includes(path)
  );

  return (
    <div className="page-tab">
      <div className="tab-links">
        <div className="tab-container">
          <ul>
            {Object.keys(headings).map((path) => (
              <li key={path} className={activePath === path ? "active" : ""}>
                <a onClick={() => navigate(`${path}`)}>{headings[path]}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="content-Div">{content}</div>
    </div>
  );
};

export default PageTab;
