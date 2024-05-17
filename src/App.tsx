import "./App.css";
import { List } from "antd";
import { routes } from "./router";

function App() {
  function handleClick(info) {
    console.log("info: ", info);
    window.open(info.path);
  }
  return (
    <List
      size="large"
      header={
        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          DEMO列表
        </div>
      }
      bordered
      dataSource={routes.slice(1)}
      renderItem={(item) => (
        <List.Item style={{ display: "flex", justifyContent: "center" }}>
          <a onClick={() => handleClick(item)}>{item._info.title}</a>
        </List.Item>
      )}
    />
  );
}

export default App;
