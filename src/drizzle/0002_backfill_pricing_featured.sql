-- 回填存量数据的 pricing / featured 字段（0001 只加列不填值）。
-- 从种子数据的定价标签与"编辑推荐"标签推导，幂等：
-- 已回填过或未使用种子标签体系的库执行后均无副作用。
UPDATE tool SET pricing = 'free'
FROM tool_tag
WHERE tool_tag.tool_id = tool.id AND tool_tag.tag_id = 'tag_free' AND tool.pricing IS NULL;--> statement-breakpoint
UPDATE tool SET pricing = 'freemium'
FROM tool_tag
WHERE tool_tag.tool_id = tool.id AND tool_tag.tag_id = 'tag_freemium' AND tool.pricing IS NULL;--> statement-breakpoint
UPDATE tool SET pricing = 'paid'
FROM tool_tag
WHERE tool_tag.tool_id = tool.id AND tool_tag.tag_id = 'tag_paid' AND tool.pricing IS NULL;--> statement-breakpoint
UPDATE tool SET featured = true
FROM tool_tag
WHERE tool_tag.tool_id = tool.id AND tool_tag.tag_id = 'tag_editors_choice' AND tool.featured = false;
