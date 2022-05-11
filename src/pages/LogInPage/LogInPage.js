import styled from "styled-components";
import { useState, useContext } from "react";
import { registerOrLogin, getMe } from "../../WebAPI";
import { setAuthToken } from "../../utils/authorization";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context";
import { useEffect, useCallback } from "react";

const Root = styled.div`
  margin: 30px 0;
  height: 650px;
`;

const LogInContainer = styled.div`
  width: 45%;
  margin: 0 auto;
  padding: 50px 0px;
`;

const TitleContainer = styled.div`
  display: flex;
`;

const Register = styled.div`
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  color: white;
  height: 55px;
  background: linear-gradient(to right, #50256c, #2348a0);
  letter-spacing: 20px;
  cursor: pointer;
  font-weight: bold;

  ${(props) =>
    !props.$active &&
    `
      background: #e8e5f8;
      color: #9e9e9f;

      :hover {
        color: #50256c;
      }
  `}
`;

const LogIn = styled(Register)``;

const ContentContainer = styled.div`
  background: #e8e5f8;
  width: 100%;
  padding-top: 70px;
  box-sizing: border-box;
  border: 4px solid #000;
  border-image-source: linear-gradient(to right, #50256c, #2348a0);
  border-image-slice: 20;
  height: 500px;
`;

const Username = styled.div`
  display: flex;
  margin: 0px 0px 60px 18%;
  font-size: 18px;
  align-items: center;

  input {
    width: 50%;
    height: 30px;
    margin-left: 1%;

    ::placeholder {
      color: #b4b4b5;
    }
  }

  ${(props) =>
    props.$isLoginMode &&
    `
    margin: 45px 0px 90px 18%;
  `}
`;

const Nickname = styled(Username)``;

const Password = styled(Username)`
  margin: 0px 0px 40px 18%;

  ${(props) =>
    props.$isLoginMode &&
    `
    margin: 45px 0px 55px 18%;
  `}
`;

const TogglePassword = styled.div`
  cursor: pointer;
  font-size: 16px;
  color: #888888;
  margin-left: 3%;

  :hover {
    color: #50256c;
  }
`;

const Submit = styled.button`
  display: flex;
  cursor: pointer;
  background: #50256c;
  color: white;
  border-radius: 3px;
  width: 30%;
  height: 45px;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin: 30px auto;
  font-size: 18px;
  letter-spacing: 12px;
  font-weight: bold;
  padding-left: 10px;
  border: none;

  :hover {
    background: #2348a0;
  }
`;

const Error = styled.div`
  color: red;
  font-weight: bold;
  margin-left: 15%;
  font-size: 16px;
  visibility: hidden;
  height: 30px;

  ${(props) =>
    props.$hasError &&
    `
    visibility: visible;
  `}
`;

const SuccessMessageContainer = styled(ContentContainer)``;

const SuccessMessageContent = styled.div`
  font-size: 30px;
  font-weight: bold;
  color: #50256c;
  margin: 30px auto;
  text-align: center;
  padding-bottom: 30px;
`;

const ToHomePageButton = styled(Submit)``;

function LogInPage() {
  const [passwordShown, setPasswordShown] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(successMessage);
    if (successMessage) return;
    if (user && user !== "comfirming") {
      console.log(successMessage);
      navigate("/");
    }
  }, [user, successMessage]);
  // 其他加了 dependency 的頁面也要試試看

  const handleModeChange = useCallback(
    (mode) => {
      // 如果當下已經在點擊的那個模式，就不用換直接 return
      if (
        (mode === "Register" && isRegisterMode) ||
        (mode === "LogIn" && !isRegisterMode)
      ) {
        return;
      }
      setIsRegisterMode((prevState) => !prevState);
    },
    [isRegisterMode]
  );

  const handleTogglePassword = useCallback(() => {
    setPasswordShown((prevState) => !prevState);
  }, []);

  const handleInputFocus = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const handleUsernameChange = useCallback((e) => {
    setUsername(e.target.value);
  }, []);

  const handleNicknameChange = useCallback((e) => {
    setNickname(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // 先檢查有沒有沒填的
    // 如果是登入（不是註冊）就不用檢查 nickname，request header 也不用帶 nickname
    if (username && password && (isRegisterMode ? nickname : true)) {
      registerOrLogin(username, password, isRegisterMode ? nickname : false)
        .then((data) => {
          if (data.ok !== 1) {
            return setErrorMessage(data.message);
          }
          setAuthToken(data.token);
          getMe().then((res) => {
            if (res.ok !== 1) {
              setErrorMessage(res.message);
              setAuthToken(null);
              return;
            }
            setSuccessMessage(true);
            setUser(res.data);
          });
        })
        .catch(() => setErrorMessage("伺服器異常，請稍後再試"));
      return;
    }
    setErrorMessage("請確實填寫所有欄位！");
  };

  const handleToHomePageButtonClick = useCallback(() => {
    navigate("/");
  }, []);

  return (
    <Root>
      <LogInContainer>
        <TitleContainer>
          <Register
            $active={isRegisterMode}
            onClick={() => handleModeChange("Register")}
          >
            註冊
          </Register>
          <LogIn
            $active={!isRegisterMode}
            onClick={() => handleModeChange("LogIn")}
          >
            登入
          </LogIn>
        </TitleContainer>
        {!successMessage && (
          <ContentContainer>
            <form onSubmit={handleFormSubmit}>
              <Username $isLoginMode={!isRegisterMode}>
                帳號：
                <input
                  type="text"
                  placeholder="請輸入帳號"
                  onFocus={handleInputFocus}
                  value={username}
                  onChange={handleUsernameChange}
                />
              </Username>
              {isRegisterMode && (
                <Nickname>
                  暱稱：
                  <input
                    type="text"
                    placeholder="請輸入暱稱"
                    onFocus={handleInputFocus}
                    value={nickname}
                    onChange={handleNicknameChange}
                  />
                </Nickname>
              )}
              <Password $isLoginMode={!isRegisterMode}>
                密碼：
                <input
                  type={passwordShown ? "text" : "password"}
                  placeholder="請輸入密碼"
                  onFocus={handleInputFocus}
                  value={password}
                  onChange={handlePasswordChange}
                />
                <TogglePassword onClick={handleTogglePassword}>
                  {passwordShown ? "隱藏密碼" : "顯示密碼"}
                </TogglePassword>
              </Password>
              <Error $hasError={errorMessage}>{errorMessage}</Error>
              <Submit>{isRegisterMode ? "註冊" : "登入"}</Submit>
            </form>
          </ContentContainer>
        )}
        {successMessage && (
          <SuccessMessageContainer>
            <SuccessMessageContent>{`${
              isRegisterMode ? "註冊" : "登入"
            }成功！`}</SuccessMessageContent>
            <ToHomePageButton onClick={handleToHomePageButtonClick}>
              返回首頁
            </ToHomePageButton>
          </SuccessMessageContainer>
        )}
      </LogInContainer>
    </Root>
  );
}

export default LogInPage;
