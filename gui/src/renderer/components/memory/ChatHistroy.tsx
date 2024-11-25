import React, {useEffect, useState} from "react";
import {Space, Table, TableProps} from "antd";
import chatHistroyHandle from "../../features/memory/chatHistroyHandle";
import {useParams} from "react-router-dom";

// 假定服务端返回的数据结构
interface ChatHistoryData {
  question: string;
  answer: string;
  sender: string;
  // 你的其他字段...
}

// DataType 接口现在映射到你实际从服务端接收的数据的结构
interface DataType extends ChatHistoryData {
  key: string; // 保证 key 值的唯一性，用于 React 渲染优化
}

const columns: TableProps<DataType>['columns'] = [
  {
    title: '问题',
    dataIndex: 'question',
    key: 'question',
  },
  {
    title: '回答',
    dataIndex: 'answer',
    key: 'answer',
  },
  {
    title: '发送者',
    dataIndex: 'sender',
    key: 'sender',
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 100,
    render: (_, record) => (
      <Space size="middle">
        {/* 这里根据需要添加你的操作链接或者按钮 */}
        <a>删除</a>
      </Space>
    ),
  },
];

interface ChatHistroyProps {
  characterId: number;
}

const ChatHistroy: React.FC<ChatHistroyProps> = ({characterId}) => {
  const [chatHistories, setChatHistories] = useState<DataType[]>([]);
  const [pagination, setPagination] = useState({current: 1, pageSize: 5, total: 0});
  const [loading, setLoading] = useState(false);

  // 拉取数据
  const fetchChatHistories = async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      const dataTotal = await chatHistroyHandle.findCountByCharacterId(characterId);
      const result = await chatHistroyHandle.findByCharacterId({
        characterId: characterId,
        page: page,
        pageSize: pageSize,
      });
      setChatHistories(result.map((item, index) => ({...item, key: `${page}-${index}`})));
      setPagination({
        ...pagination,
        total: dataTotal,
        current: page,
        pageSize: pageSize,
      });
    } catch (error) {
      console.error("Failed to fetch chat histories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistories(pagination.current, pagination.pageSize);
  }, [characterId, pagination.current, pagination.pageSize]);

  const handleTableChange = (newPagination, filters, sorter) => {
    fetchChatHistories(newPagination.current, newPagination.pageSize);
  };

  return (
    <>
      <Table
        columns={columns}
        dataSource={chatHistories}
        pagination={pagination}
        loading={loading}
        size="middle"
        onChange={handleTableChange}
      />
    </>
  );
};

export default ChatHistroy;
