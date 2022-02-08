// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, {
  createContext, useContext, useMemo, useReducer,
} from "react";
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import { useApiProvider } from "./ApiProvider";

const GET_USER_RESPONSE = "GET_USER_RESPONSE";
const GET_PHOTO_RESPONSE = "GET_PHOTO_RESPONSE";

interface RequestUserPhotoAction {
  type: typeof GET_USER_RESPONSE;
  payload: { userPrincipalName: string, user: MicrosoftGraph.User }
}

interface ResponseUserPhotoAction {
  type: typeof GET_PHOTO_RESPONSE;
  payload: { userPrincipalName: string, photoUrl: string | null }
}

type MapProviderAction = RequestUserPhotoAction | ResponseUserPhotoAction;

interface MapState {
  photos: Record<string, string | null>
  users: Record<string, MicrosoftGraph.User>
}

interface MapModel {
  state: MapState;
  getUserPhoto: (userPrincipalName: string) => Promise<string | null>;
  getUser: (userPrincipalName: string) => Promise<MicrosoftGraph.User>;
}

const initialState: MapState = {
  photos: {},
  users: {},
};

const Context = createContext({} as MapModel);

const reducer = (state: MapState, action: MapProviderAction): MapState => {
  switch (action.type) {
    case GET_USER_RESPONSE: {
      return {
        ...state,
        users: {
          ...state.users,
          [action.payload.userPrincipalName]: action.payload.user,
        },
      };
    }
    case GET_PHOTO_RESPONSE: {
      return {
        ...state,
        photos: {
          ...state.photos,
          [action.payload.userPrincipalName]: action.payload.photoUrl,
        },
      };
    }
    default:
      return state;
  }
};

const MapProvider: React.FC = ({ children }) => {
  const { userService } = useApiProvider();
  const photoService = useMemo(
    () => userService.createUserPhotoService(),
    [userService.createUserPhotoService],
  );
  const [state, dispatch] = useReducer(
    reducer,
    initialState,
  );

  const getUserPhoto = (userPrincipalName: string): Promise<string | null> => {
    if (state.photos[userPrincipalName] !== undefined) {
      return Promise.resolve(state.photos[userPrincipalName]);
    }
    return photoService.getItems([userPrincipalName])
      .then(([photo]) => {
        dispatch({
          type: GET_PHOTO_RESPONSE,
          payload: {
            userPrincipalName,
            photoUrl: photo.userPhoto,
          },
        });
        return photo.userPhoto;
      })
      .catch(() => null);
  };

  const getUser = (userPrincipalName: string): Promise<MicrosoftGraph.User> => {
    if (state.users[userPrincipalName]) {
      return Promise.resolve(state.users[userPrincipalName]);
    }
    return userService.getCollaborator(userPrincipalName)
      .then((user) => {
        dispatch({
          type: GET_USER_RESPONSE,
          payload: {
            userPrincipalName,
            user,
          },
        });
        return user;
      })
      .catch(() => ({ displayName: userPrincipalName }));
  };

  return (
    <Context.Provider value={{
      state,
      getUserPhoto,
      getUser,
    }}
    >
      {children}
    </Context.Provider>
  );
};

const useMapProvider = (): MapModel => useContext(Context);
export { MapProvider, useMapProvider };
