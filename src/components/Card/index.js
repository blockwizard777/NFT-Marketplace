import React, { useState } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import styles from "./Card.module.sass";
import Icon from "../Icon";

const Card = ({ className, item, buyNft }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn(styles.card, className)}>
      <div className={styles.preview}>
        <img src={item.image} alt="Card" />
        <div className={styles.control}>
          <div
            className={cn(
              { "status-green": "green" === "green" },
              styles.category
            )}
          >
            purchasing !
          </div>
          <button
            className={cn(styles.favorite, { [styles.active]: visible })}
            onClick={() => setVisible(!visible)}
          >
            <Icon name="heart" size="20" />
          </button>
          <button 
            className={cn("button-small", styles.button)}
            onClick={()=> buyNft(item)}
          >
            <span>Buy now</span>
            <Icon name="scatter-up" size="16" />
          </button>
        </div>
      </div>
      <Link className={styles.link} to='/item'>
        <div className={styles.body}>
          <div className={styles.line}>
            <div className={styles.title}>{item.name}</div>
            <div className={styles.price}>{item.price && `${item.price} ETH`}</div>
          </div>
          <div className={styles.line}>
            <div className={styles.users}>
              {/* {item.users.map((x, index) => ( */}
                <div className={styles.avatar}>
                  <img src='/images/content/avatar-1.jpg' alt="Avatar" />
                </div>
                <div className={styles.avatar}>
                  <img src='/images/content/avatar-1.jpg' alt="Avatar" />
                </div>
              {/* ))} */}
            </div>
            <div className={styles.counter}>3 in stock</div>
          </div>
        </div>
        <div className={styles.foot}>
          <div className={styles.status}>
            <Icon name="candlesticks-up" size="20" />
            Highest bid <span>0.001 ETH</span>
          </div>
          <div
            className={styles.bid}
            // dangerouslySetInnerHTML={{ __html: item.bid }}
          >
            New bid <span role="img" aria-label="fire">🔥</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Card;
