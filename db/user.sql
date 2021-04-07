USE [pskp_course]
GO

/****** Object:  Table [dbo].[user_table]    Script Date: 06.03.2021 20:59:21 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO
drop table if exists [dbo].[user];
CREATE TABLE [dbo].[user](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_name] [nvarchar](50) NOT NULL unique,
	[email] [nvarchar](50) NULL,
	[password] [nvarchar](200) NOT NULL,
	[role] [int] default 0
 CONSTRAINT [PK_user_table] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

