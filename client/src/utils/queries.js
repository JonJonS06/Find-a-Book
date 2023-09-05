import gql from "@apollo/client";

export const Get_Me = gql`
  query GetMe {
    me {
      _id
      username
      email
      bookCount
      savedBooks {
        bookId
        authors
        description
        title
        image
        link
      }
    }
  }
`;
