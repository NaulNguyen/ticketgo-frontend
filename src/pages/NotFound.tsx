import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
    const textElementRef = useRef<HTMLHeadingElement>(null);
    const navigate = useNavigate();

    return (
        <>
            <style>
                {`
          .section {
            padding: 4rem 2rem;
          }

          .section .error {
            font-size: 150px;
            color: #0a426e;
            text-shadow: 
              1px 1px 1px #093658,    
              2px 2px 1px #093658,
              3px 3px 1px #093658,
              4px 4px 1px #093658,
              5px 5px 1px #093658,
              6px 6px 1px #093658,
              7px 7px 1px #093658,
              8px 8px 1px #093658,
              25px 25px 8px rgba(0, 0, 0, 0.2);
          }

          .page {
            margin: 2rem 0;
            font-size: 20px;
            font-weight: 600;
            color: #444;
          }

          .back-home {
            display: inline-block;
            color: #fff;
            background-color: #0d2e59;
            text-transform: uppercase;
            font-weight: 600;
            padding: 0.75rem 1rem 0.6rem;
            transition: all 0.2s linear;
            box-shadow: 0 15px 15px -11px rgba(0, 0, 0, 0.4);
            border-radius: 6px;
          }

          .back-home:hover {
            background-color: #2474e5;
          }
        `}
            </style>
            <div className="section flex flex-col justify-center items-center">
                <h1 className="error" ref={textElementRef}>
                    404
                </h1>
                <div className="page">Ooops!!! The page you are looking for is not found</div>
                <button className="back-home" onClick={() => navigate("/")}>
                    Back to home
                </button>
            </div>
        </>
    );
};

export default NotFound;
