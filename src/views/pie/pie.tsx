import React, { useEffect, useRef } from "react";
import styles from "./pie.module.less";
import { ThreeEngine } from './engine/TEngine';

function Pie() {
  const threeTarget = useRef(null)
  const tEngine = useRef(null)
  useEffect(() => {
    tEngine.current = new ThreeEngine(threeTarget.current)
    tEngine.current.restPath()
    return () => {
      tEngine.current.destroy()
    }
  }, [])
  return (
    <div className={styles["three-canvas"]} ref={threeTarget}>
    </div>
  );
}

export default Pie;
