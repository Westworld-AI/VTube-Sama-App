import { css } from '@emotion/css';

// 样式：整个 Collapse 组件的容器
export const collapseContainer = css`
  .ant-collapse > .ant-collapse-item > .ant-collapse-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  // 调整箭头的位置使其垂直居中
  .ant-collapse > .ant-collapse-item > .ant-collapse-header .ant-collapse-arrow {
    line-height: inherit;
    vertical-align: baseline;
  }

  // 使 label 和 extra content 对齐
  .ant-collapse .ant-collapse-extra {
    display: flex;
    align-items: center;
  }
`;

// 样式：Collapse.Panel 的 header 中包含 label 和 extra 的部分
export const collapseHeaderContent = css`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
`;

// 样式：为 label 和 extra 提供的空间，使其在内容之间对齐
export const collapseHeaderLabel = css`
  flex: 1;
`;

export const collapseHeaderExtra = css`
  display: flex;
  align-items: center;
`;
