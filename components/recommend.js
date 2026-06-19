// recommand.js
import { Index } from "/vendor/flexsearch.light.module.min.js";

/**
 * 根据内容相似度推荐文章标题
 * @param {string} content - 当前文章内容
 * @param {Array<{title: string, preview: string}>} articles - 候选文章列表
 * @returns {string[]} 按相关性降序排列的所有文章标题
 */
function recommand(content, articles) {
  if (!articles || articles.length === 0) return [];

  // 创建索引，使用 forward 分词支持部分匹配
  const index = new Index({
    tokenize: "forward"   // 默认编码器会进行大小写标准化和字符去重
  });

  // 将每篇文章的标题和摘要合并后加入索引
  articles.forEach((article, i) => {
    index.add(i, `${article.title} ${article.preview}`.trim());
  });

  // 以当前文章内容作为查询，启用建议模式以获得宽松的匹配
  const results = index.search({
    query: content,
    limit: articles.length,   // 返回所有可能的结果
    suggest: true             // 允许部分匹配，确保长文本也能得到结果
  });

  // 将未匹配到的文章追加到末尾，保证返回所有文章
  const matchedSet = new Set(results);
  const allIds = [...results];
  for (let i = 0; i < articles.length; i++) {
    if (!matchedSet.has(i)) allIds.push(i);
  }

  return allIds.map(id => articles[id].title);
}

// 暴露为全局函数，以便在普通 <script> 中直接调用
window.recommand = recommand;